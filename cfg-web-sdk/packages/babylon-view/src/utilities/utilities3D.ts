import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Transform as ModelTransform } from "@configura/web-api";
import { SymTransform } from "@configura/web-core/dist/cm/format/cmsym/components/SymTransform";
import { Angle } from "@configura/web-core/dist/cm/geometry/Angle";
import { Matrix33 } from "@configura/web-core/dist/cm/geometry/Matrix33";
import { Orientation } from "@configura/web-core/dist/cm/geometry/Orientation";
import { Point } from "@configura/web-core/dist/cm/geometry/Point";
import { Transform as GeoTransform } from "@configura/web-core/dist/cm/geometry/Transform";
import { CfgBoundingBox } from "./CfgBoundingBox";

export function vector3Equals(left: Vector3, right: Vector3) {
	return left.x === right.x && left.y === right.y && left.z === right.z;
}

export function vector3sAreSignificantlyDifferent(
	vector0: Vector3,
	vector1: Vector3,
	acceptableDifference: number
) {
	return (
		isSignificantDifference(vector0.x, vector1.x, acceptableDifference) ||
		isSignificantDifference(vector0.y, vector1.y, acceptableDifference) ||
		isSignificantDifference(vector0.z, vector1.z, acceptableDifference)
	);
}

export function isSignificantDifference(a: number, b: number, acceptableDifference: number) {
	return isFinite(a) !== isFinite(b) || acceptableDifference < (Math.abs(a - b) * 2) / (a + b);
}

export function boundingBoxesAreSignificantlyDifferent(
	bb0: CfgBoundingBox,
	bb8: CfgBoundingBox,
	acceptableDifference: number
) {
	return (
		bb0.isEmpty !== bb8.isEmpty ||
		vector3sAreSignificantlyDifferent(bb0.minimum, bb8.minimum, acceptableDifference) ||
		vector3sAreSignificantlyDifferent(bb0.maximum, bb8.maximum, acceptableDifference)
	);
}

export function unifyBoundingRect(
	boundingRect: ClientRect | DOMRect
): { x: number; y: number; width: number; height: number } {
	function isDomRect(object: unknown): object is DOMRect {
		return typeof object === "object" && object !== null && "x" in object;
	}

	if (isDomRect(boundingRect)) {
		return boundingRect;
	}

	return {
		x: boundingRect.left,
		y: boundingRect.top,
		width: boundingRect.width,
		height: boundingRect.height,
	};
}

export function symTransformToMatrix(symTransform: GeoTransform): Matrix {
	const pos = symTransform.pos;
	const mapping = symTransform.mapping || Matrix33.identity;
	const { c0, c1, c2 } = mapping;

	return Matrix.FromValues(
		c0.x,
		c0.y,
		c0.z,
		0,
		c1.x,
		c1.y,
		c1.z,
		0,
		c2.x,
		c2.y,
		c2.z,
		0,
		pos.x,
		pos.y,
		pos.z,
		1
	);
}

export function modelTransformsEqual(left: ModelTransform, right: ModelTransform): boolean {
	const { scale: leftScale, pos: leftPos, rot: leftRot } = left;
	const { scale: rightScale, pos: rightPos, rot: rightRot } = right;

	return (
		leftScale.x === rightScale.x &&
		leftScale.y === rightScale.y &&
		leftScale.z === rightScale.z &&
		leftPos.x === rightPos.x &&
		leftPos.y === rightPos.y &&
		leftPos.z === rightPos.z &&
		leftRot.pitch === rightRot.pitch &&
		leftRot.roll === rightRot.roll &&
		leftRot.yaw === rightRot.yaw
	);
}

export function modelTransformToSymTransform(modelTransform: ModelTransform): SymTransform {
	const { pos, scale, rot } = modelTransform;

	return new SymTransform(
		new Point(pos.x, pos.y, pos.z),
		new Orientation(new Angle(rot.yaw), new Angle(rot.pitch), new Angle(rot.roll)),
		undefined,
		new Point(scale.x, scale.y, scale.z)
	);
}

export function cloneName(name: string) {
	if (!name.endsWith(" ")) {
		name += " ";
	}
	return name + "(clone)";
}

export function measureLongestDistanceToCorner(
	bb: CfgBoundingBox,
	measureComponents: number[]
): number {
	if (bb.isEmpty) {
		throw Error("Empty bounding box");
	}

	const minimum = bb.minimum.asArray();
	const maximum = bb.maximum.asArray();

	let longestSquaredDistanceFromCenter = 0;

	const cornerCount = Math.pow(2, measureComponents.length);
	for (let i = 0; i < cornerCount; i++) {
		const vectorComponents = measureComponents.map(
			(componentIndex, n) => (i & (1 << n) ? minimum : maximum)[componentIndex]
		);

		const squaredDistance = vectorComponents.reduce((pV, cV) => pV + Math.pow(cV, 2), 0);

		longestSquaredDistanceFromCenter = Math.max(
			longestSquaredDistanceFromCenter,
			squaredDistance
		);
	}

	return Math.sqrt(longestSquaredDistanceFromCenter);
}
