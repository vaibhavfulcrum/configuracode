import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymNode } from "../SymNode";

export type DexObjKey = "children" | "xRef";

export type SymComponentKey =
	| "symBox"
	| "symBoolOp"
	| "symCircle"
	| "symCone"
	| "symConnector"
	| "symCylinder"
	| "symDexObj"
	| "symEllipse"
	| "symGMaterial"
	| "symGfx"
	| "symLODGroup"
	| "symLines2D"
	| "symLines3D"
	| "symMeasure"
	| "symMesh"
	| "symNXRef"
	| "symParams"
	| "symPlane"
	| "symPlaneDivider"
	| "symPoints"
	| "symProgs"
	| "symProps"
	| "symRect"
	| "symReps"
	| "symShape"
	| "symConnectPoint"
	| "symSphere"
	| "symTags"
	| "symText2D"
	| "symText3D"
	| "symTransform"
	| "symUCache"
	| "symUVMapper"
	| "symVisibility"
	| "symExtrusion"
	| "symCustom" // legacy.
	| "symTmp" // legacy.
	| "symCache"; // legacy.

export enum SymGfxMode {
	undefined = 0,
	x3D = 1,
	x2D = 2,
}

export class SymComponent {
	public id = "" as SymComponentKey;
	public node?: SymNode;

	constructor(public src?: string) {}

	features(): Set<string> | undefined {
		return;
	}

	addComponent(node: SymNode, invalidate: boolean) {
		if (invalidate) {
			node.addFeaturesFrom(this);
			// node.invalidateComponent(this, false);
		}
		this.node = node;
	}

	componentAdded(invalidate: boolean) {
		// debug
	}

	load(logger: Logger, obj: DexObj, _env: SymImportEnv, force = false) {}

	lazyLoad(logger: Logger, obj: DexObj, _env: SymImportEnv) {
		throw logger.errorAsObject("SymComponent.lazyLoad called on base class");
	}

	loadChildren() {
		throw new Error("SymComponent.loadChildren called on base class");
	}

	breaksDex(): boolean {
		return true;
	}

	blockBound() {
		return false;
	}

	invalidation(removed: boolean): SymInv[] | undefined {
		return;
	}

	toString(): string {
		return this.id || "symComponentBase";
	}
}
