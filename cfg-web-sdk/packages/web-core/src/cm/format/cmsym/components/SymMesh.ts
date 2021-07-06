import { Logger } from "@configura/web-utilities";
import { ATriMeshF } from "../../../core3D/ATriMeshF";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymComponent, SymComponentKey } from "./SymComponent";
import { SymGetMeshEnv } from "./SymGetMeshEnv";
import { SymPropsInv, SYM_GEOMETRY_KEY, SYM_LOCAL_BOUND_KEY } from "./SymProps";

/**
 * Represents a SymMesh node in the CmSym format.
 *
 * @remarks
 * Specification: {@link https://www.configura.com/cmsym/#SymMesh CmSym - SymMesh}
 */
export class SymMesh extends SymComponent {
	id: SymComponentKey = "symMesh";

	constructor(
		private _mesh?: ATriMeshF,
		public cachedKey?: string,
		public shared = false,
		src?: string
	) {
		super(src);
	}

	load(logger: Logger, dexObj: DexObj, _env: SymImportEnv, force = false) {
		if (force) {
			this.loadLazy(logger, dexObj);
		}
	}

	loadLazy(logger: Logger, dexObj?: DexObj) {
		if (this._mesh === undefined) {
			this.loadMesh(logger, dexObj);
		}
	}

	loadMesh(logger: Logger, dexObj?: DexObj) {
		if (dexObj === undefined) {
			dexObj = this.dexObj();
		}

		if (dexObj !== undefined) {
			const meshProperty = dexObj.get("mesh");
			if (meshProperty instanceof DexObj) {
				const mesh = toATriMesh(logger, meshProperty);
				if (mesh instanceof Error) {
					return mesh;
				}
				this._mesh = mesh;
			} else {
				return logger.errorAsObject("[SymMesh.loadMesh] unexpected type:", meshProperty);
			}
		} else {
			return logger.errorAsObject("[SymMesh.loadMesh] no dexObj!");
		}
	}

	mesh(logger: Logger, env: SymGetMeshEnv): ATriMeshF | undefined {
		if (this._mesh === undefined && env.load) {
			this.loadMesh(logger);
		}

		const mesh = this._mesh;
		if (mesh === undefined) {
			return;
		}

		if (env.doubleSided !== !mesh.doubleSided) {
			this.unshare();
			mesh.doubleSided = env.doubleSided;
		}

		// Inside-out doesn't make any sense on double sided meshes
		if (env.insideOut && !mesh.doubleSided) {
			this.unshare();
			mesh.reverse();
		}

		if (!mesh.hasNormals()) {
			mesh.autoNormals();
		}

		if (env.requiresUVs && !mesh.hasUVCoordinates()) {
			this.createUVCoordinates(logger);
		}

		return this._mesh;
	}

	createUVCoordinates(logger: Logger) {
		throw logger.errorAsObject("[SymMesh.createUVCoordinates] not yet implemented");
	}

	unshare() {
		if (this.shared) {
			this._mesh = this._mesh && this._mesh.copy();
			this.cachedKey = undefined;
			this.shared = false;
		}
	}

	dexObj(): DexObj | undefined {
		const dex = this.node && this.node.dexObj();
		if (dex && dex instanceof DexObj) {
			const dexMesh = dex.get("symMesh");
			if (dexMesh instanceof DexObj) {
				return dexMesh;
			}
			return;
		}
	}

	features() {
		return new Set(["mesh", "solid"]);
	}

	invalidation(removed: boolean): SymInv[] {
		return [new SymPropsInv(SYM_LOCAL_BOUND_KEY), new SymPropsInv(SYM_GEOMETRY_KEY)];
	}
}

function toATriMesh(logger: Logger, obj: DexObj): ATriMeshF | Error {
	if (obj.type !== "ctmMesh") {
		return logger.errorAsObject("bad obj.type: !== ctmMesh", obj.type);
	}

	// Undefined will result in false, checked with CM code to be correct.
	const llto = obj.get("lowerLeftTextureOrigin");
	if (llto instanceof Error) {
		return llto;
	} else if (llto !== undefined && typeof llto !== "boolean") {
		throw logger.errorAsObject(`bad obj.lowerLeftTextureOrigin:`, llto);
	}

	// Undefined will result in false, checked with CM code to be correct.
	const doubleSided = obj.get("doubleSided");
	if (doubleSided instanceof Error) {
		return doubleSided;
	} else if (doubleSided !== undefined && typeof doubleSided !== "boolean") {
		throw logger.errorAsObject("bad obj.doubleSided:", doubleSided);
	}

	const data = obj.get("data");
	if (data instanceof Error) {
		return data;
	} else if (data instanceof Uint8Array) {
		return new ATriMeshF(data, llto ? true : false, doubleSided ? true : false);
	}

	return logger.errorAsObject("bad data", data);
}
