import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { InspectableType } from "@babylonjs/core/Misc/iInspectable";
import { CfgMtrlSourceWithMetaData, logMtrlSourceWithMetaDataToConsole } from "@configura/web-api";
import { SymGfxMode } from "@configura/web-core/dist/cm/format/cmsym/components/SymComponent";
import { SymGMaterial } from "@configura/web-core/dist/cm/format/cmsym/components/SymGMaterial";
import { SymMesh } from "@configura/web-core/dist/cm/format/cmsym/components/SymMesh";
import { SymReps } from "@configura/web-core/dist/cm/format/cmsym/components/SymReps";
import { SymNode } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DetailLevel, DetailMask } from "@configura/web-core/dist/cm/geometry/DetailMask";
import { Logger, LogObservable, LogProducer } from "@configura/web-utilities";
import { AnimatableObject } from "../animation/AnimatableObject";
import { CoordinatorWithMeta } from "../animation/coordinator/Coordinator";
import { CfgGeometry } from "../geometry/CfgGeometry";
import { CfgMesh } from "../geometry/CfgMesh";
import { splitIndexComplete, splitIndexQuick } from "../geometry/geoSplitter";
import { CfgMaterial } from "../material/CfgMaterial";
import {
	gMaterialToCfgMaterial,
	MaterialMetaData,
	mtrlSourceToCfgMaterial,
} from "../material/material";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import { RenderEnv } from "../view/RenderEnv";
import { CfgTransformNode } from "./CfgTransformNode";

const QUICK_SPLIT_INDEX_SIZE_LIMIT = 20000;
const COMPLETE_SPLIT_INDEX_SIZE_LIMIT = 5000;
const COMPLETE_SPLIT_FINAL_GROUPS_COUNT_LIMIT = 20;
const COMPLETE_SPLIT_PROGRESS_GROUPS_COUNT_LIMIT = 100;

enum SplitGeoStatus {
	Idle = "Idle",
	Splitting = "Splitting",
	Unapplied = "Unapplied",
	Done = "Done",
}

function getDetailMask(symNode: SymNode): DetailMask | undefined {
	const symReps = symNode.symReps();
	if (!(symReps instanceof SymReps)) {
		return;
	}
	if (symReps._details === undefined) {
		return;
	}
	const lod = symReps._details.get(SymGfxMode.x3D);
	if (!(lod instanceof DetailMask)) {
		return;
	}
	return lod;
}

async function symMeshToGeometry(
	logger: Logger,
	renderEnvironment: RenderEnv,
	symMesh: SymMesh
): Promise<CfgGeometry | undefined> {
	return renderEnvironment.geometryCache.get(symMesh, async () => {
		const mesh = symMesh.mesh(logger, renderEnvironment.symMeshEnv);
		if (mesh === undefined) {
			logger.error("symMesh.mesh() === undefined", symMesh);
			return undefined;
		}
		return CfgGeometry.fromATriMeshF(mesh, symMesh, renderEnvironment.scene);
	});
}

export class CfgDeferredMeshNode extends CfgTransformNode implements LogProducer, AnimatableObject {
	static async makeCfgDeferredMesh(
		logger: Logger,
		renderEnvironment: RenderEnv,
		detailLevel: DetailLevel,
		symNode: SymNode,
		gMaterial: SymGMaterial | undefined
	): Promise<CfgDeferredMeshNode | undefined> {
		const symMesh = symNode.symMesh();
		if (!(symMesh instanceof SymMesh)) {
			return;
		}

		const lod = getDetailMask(symNode);
		if (lod === undefined) {
			logger.error("Did not have any detailLevel information");
			return;
		} else if (!lod.includes(detailLevel)) {
			return;
		}

		const bufferGeometry = await symMeshToGeometry(logger, renderEnvironment, symMesh);

		if (bufferGeometry === undefined) {
			return;
		}

		const mesh = symMesh.mesh(logger, renderEnvironment.symMeshEnv);
		const doubleSidedMesh = mesh?.doubleSided;
		const lowerLeftTextureOrigin = mesh?.lowerLeftTextureOrigin;

		return new CfgDeferredMeshNode(
			renderEnvironment,
			"(Deferred Mesh) " + symNode.id,
			lod,
			gMaterial,
			doubleSidedMesh,
			lowerLeftTextureOrigin,
			bufferGeometry
		);
	}

	get cfgClassName(): string {
		return "CfgDeferredMeshNode";
	}

	private _material: CfgMaterial | undefined;
	private _dummyMaterial: CfgMaterial;

	public _materialMetaData: MaterialMetaData | undefined;
	private _materialLoadedPromise: Promise<void> | undefined;
	private _materialIsDirty = false;
	public _mtrlSourceWithMetaData: CfgMtrlSourceWithMetaData | undefined | null = null;

	private _splitGeoStatus = SplitGeoStatus.Idle;
	private _splitGeos: CfgGeometry[] | undefined;

	public logger = new LogObservable();

	private constructor(
		renderEnvironment: RenderEnv,
		name: string,
		public lod: DetailMask,
		private _gMaterial: SymGMaterial | undefined,
		private _meshDoubleSided: boolean | undefined,
		private _lowerLeftTextureOrigin: boolean | undefined,
		private _geo: CfgGeometry
	) {
		super(renderEnvironment, name);

		this._dummyMaterial = renderEnvironment.dummyMaterial;

		this.resetMaterial();
	}

	resetMaterial() {
		this._material = this._dummyMaterial;
		this._materialMetaData = undefined;
		this._materialIsDirty = true;
		this.applyMaterial();
	}

	get originalMatrix(): Matrix {
		return Matrix.Identity();
	}

	async setMaterialAndLoad(
		mtrlWithMetaData: CfgMtrlSourceWithMetaData | undefined,
		animatorCoordinator?: CoordinatorWithMeta
	): Promise<void> {
		if (
			this._materialLoadedPromise !== undefined &&
			mtrlWithMetaData !== undefined &&
			this._mtrlSourceWithMetaData !== undefined &&
			this._mtrlSourceWithMetaData !== null &&
			mtrlWithMetaData.mtrl.isSame(this._mtrlSourceWithMetaData.mtrl)
		) {
			return this._materialLoadedPromise;
		}

		this._mtrlSourceWithMetaData = mtrlWithMetaData;
		this._materialLoadedPromise = this.loadMaterial();

		if (animatorCoordinator !== undefined) {
			const c = animatorCoordinator.coordinator;
			c.prepareForMaterialChange.bind(c)(this, animatorCoordinator.isNewProduct);
		}

		return this._materialLoadedPromise;
	}

	private async loadMaterial(): Promise<void> {
		let material: CfgMaterial | undefined;

		const meta: MaterialMetaData = {
			logger: this.logger,
			sourcePath: ["loadMaterial"],
		};

		if (this._mtrlSourceWithMetaData === null) {
			// null === has not yet been set
			return;
		}

		try {
			if (this._mtrlSourceWithMetaData !== undefined) {
				material = await mtrlSourceToCfgMaterial(
					meta,
					this._mtrlSourceWithMetaData,
					this._renderEnvironment
				);
				if (material === undefined) {
					this.logger.error("Failed to load material from mtrlSource");
				}
			} else if (this._gMaterial !== undefined && this._gMaterial.gm !== undefined) {
				meta.sourcePath.push("embedded");

				material = await gMaterialToCfgMaterial(
					meta,
					this._renderEnvironment,
					this._gMaterial.gm
				);
				if (material === undefined) {
					this.logger.error("Failed to load material from fallback gMaterial");
				}
			}
		} catch (e) {
			this._renderEnvironment.notifyError(
				"Failed to load material. Will show default material."
			);
			this.logger.errorFromCaught(e);
		}

		if (material === undefined) {
			this.logger.warn("No material, not even fallback-material");
		}

		this._material = material;
		this._materialMetaData = meta;

		this._materialIsDirty = true;

		if (material && material.isTransparent) {
			this.startSplitGeo();
		}
	}

	applyMaterial = () => {
		if (
			this._material === undefined ||
			(!this._materialIsDirty && this._splitGeoStatus !== SplitGeoStatus.Unapplied)
		) {
			return;
		}

		this._materialIsDirty = false;
		if (this._splitGeoStatus === SplitGeoStatus.Unapplied) {
			this._splitGeoStatus = SplitGeoStatus.Done;
		}

		let geos = [this._geo];
		let labelSuffix = this.name;
		if (this._splitGeos !== undefined) {
			geos = this._splitGeos;
			labelSuffix += " (geo split)";
		}

		let doubleSided = false;
		let backToFront = false;
		let flipTexture = !this._lowerLeftTextureOrigin;

		if (this._meshDoubleSided || this._material.isDoubleSided()) {
			// Double sided can be set both by the mesh and the material, but only the material
			// controls it during rendering. Ensure we are using a material that is double sided.
			doubleSided = true;

			if (this._material.isTransparent) {
				// Mesh will render double sided with possible transparent parts, this is tricky.
				//
				// Since we don't depth sort all triangles in the mesh relative to the camera (which
				// is not doable in the general case) we need to employ a trick to make sure the
				// inside of the object gets rendered before the outside skin.
				//
				// Otherwise, semi-transparent pixels in the outer skin would fully occlude pixels
				// from the inside of the object if they happen to be rendered first. That means
				// that sometimes your would not see the inside of the object through the "holes"
				// in it.
				//
				// A good workaround for correctly made objects (where "correct" is mostly related
				// to the normals) is to render the mesh twice, first the back sides ("inside"),
				// then the front sides ("outside") of the triangles. Babylon.js has such a feature
				// built in called separateCullingPass (or "back then front" below).
				backToFront = true;
			}
		}
		const material = this._material.getPBRMaterial(doubleSided, backToFront, flipTexture);

		this.clear(true);

		for (const geo of geos) {
			const mesh = new CfgMesh(labelSuffix, this._renderEnvironment, geo, material);
			this.add(mesh);
		}
	};

	public isAllMeshMaterialsReady = () =>
		this.getChildMeshes().reduce(
			(a, m) => a && (m.material === null || m.material.isReady(m)),
			true
		);

	startSplitGeo = async (force: boolean = false) => {
		if (!force && this._splitGeoStatus !== SplitGeoStatus.Idle) {
			return;
		}

		this._splitGeoStatus = SplitGeoStatus.Splitting;

		const geo = this._geo;

		const indexCount = geo.getTotalIndices();

		if (!force && QUICK_SPLIT_INDEX_SIZE_LIMIT < indexCount) {
			return;
		}

		const splitStart = performance.now();

		const doCompleteSplit = indexCount < COMPLETE_SPLIT_INDEX_SIZE_LIMIT || force;
		let groups: number[][] | undefined;
		if (doCompleteSplit) {
			groups = splitIndexComplete(this.logger, geo, {
				maxFinalGroups: force ? Number.MAX_VALUE : COMPLETE_SPLIT_FINAL_GROUPS_COUNT_LIMIT,
				maxProgressGroups: force
					? Number.MAX_VALUE
					: COMPLETE_SPLIT_PROGRESS_GROUPS_COUNT_LIMIT,
				acceptCoordinateMatch: true,
			});
		} else {
			groups = splitIndexQuick(this.logger, geo);
		}

		if (groups === undefined || groups.length === 1) {
			this._splitGeoStatus = SplitGeoStatus.Done;
			return;
		}

		const splitEnd = performance.now();

		this._splitGeos = groups.map((group) => geo.cloneWithSubset(group));

		const repackEnd = performance.now();

		this._splitGeoStatus = SplitGeoStatus.Unapplied;

		this.logger.info(
			`${doCompleteSplit ? "Complete" : "Quick"}-split`,
			`of ${indexCount / 3} triangles into ${groups.length} disjoint groups took ${(
				splitEnd - splitStart
			).toFixed(1)} ms, repack took ${(repackEnd - splitEnd).toFixed(1)} ms.`
		);

		// If material is dirty someone else is responsible for calling applyMaterial
		// at a later point
		if (!this._materialIsDirty) {
			this.applyMaterial();
		}
	};

	get boundingBox(): CfgBoundingBox {
		return this.getChildMeshes().reduce((a, m) => {
			const bb = m.getBoundingInfo().boundingBox;

			// Here we strip away the world matrix as we handle the transforms
			// manually, and the world matrix changes depending on if the has
			// been rendered to screen yet
			a.expand(new CfgBoundingBox(bb.minimum, bb.maximum));
			return a;
		}, new CfgBoundingBox());
	}

	protected addInspectorProperties() {
		super.addInspectorProperties();
		this.addInspectableCustomProperty({
			label: "Available lod levels",
			propertyName: "_inspectorLodLevels",
			type: InspectableType.String,
		});
		this.addInspectableCustomProperty({
			label: "Mtrl Source path",
			propertyName: "_inspectorSourcePath",
			type: InspectableType.String,
		});

		this.addInspectableCustomProperty({
			label: "log mtrlSourceWithMetaData",
			propertyName: "_inspectorLogMtrlSourceWithMetaData",
			type: InspectableType.Checkbox,
		});

		this.addInspectableCustomProperty({
			label: "log GMaterial",
			propertyName: "_inspectorLogGMaterial",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "log MultiGMaterial",
			propertyName: "_inspectorLogMultiGMaterial",
			type: InspectableType.Checkbox,
		});
	}

	private get _inspectorLodLevels(): string {
		return Array.from(this.lod.detailSet().values()).join(", ");
	}

	private get _inspectorSourcePath(): string {
		if (this._materialMetaData === undefined) {
			return "-";
		}
		return this._materialMetaData.sourcePath.join(" ");
	}

	private get _inspectorLogMtrlSourceWithMetaData() {
		return this._mtrlSourceWithMetaData === undefined || this._mtrlSourceWithMetaData === null;
	}

	private set _inspectorLogMtrlSourceWithMetaData(x: boolean) {
		if (this._mtrlSourceWithMetaData === undefined || this._mtrlSourceWithMetaData === null) {
			return;
		}
		logMtrlSourceWithMetaDataToConsole(this._mtrlSourceWithMetaData);
	}

	private get _inspectorLogGMaterial() {
		return this._materialMetaData?.gMaterial === undefined;
	}

	private set _inspectorLogGMaterial(x: boolean) {
		const m = this._materialMetaData?.gMaterial;
		if (m === undefined) {
			return;
		}
		console.log(m);
	}

	private get _inspectorLogMultiGMaterial() {
		return this._materialMetaData?.multiGMaterial === undefined;
	}

	private set _inspectorLogMultiGMaterial(x: boolean) {
		const m = this._materialMetaData?.multiGMaterial;
		if (m === undefined) {
			return;
		}
		console.log(m);
	}
}
