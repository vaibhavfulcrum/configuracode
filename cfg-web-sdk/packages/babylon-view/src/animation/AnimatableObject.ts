import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { CfgTransformNode } from "../nodes/CfgTransformNode";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";

export interface AnimatableObject extends CfgTransformNode {
	originalMatrix: Matrix;
	boundingBox: CfgBoundingBox;
}

export function isAnimatableObject(object: unknown): object is AnimatableObject {
	return typeof object === "object" && object !== null && "originalMatrix" in object;
}
