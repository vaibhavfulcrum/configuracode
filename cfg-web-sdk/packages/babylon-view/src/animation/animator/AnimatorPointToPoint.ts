import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorEasingMatrix,
	AnimatorEasingMatrixConfig,
	getDefaultConfig as baseGetDefaultConfig,
} from "./AnimatorEasingMatrix";

export type AnimatorPointToPointConfig = AnimatorEasingMatrixConfig<Vector3>;

const defaultConfig: AnimatorPointToPointConfig = baseGetDefaultConfig<Vector3>(new Vector3());

export class AnimatorPointToPoint extends AnimatorEasingMatrix<
	Vector3,
	AnimatorPointToPointConfig
> {
	constructor(
		node: AnimatableObject,
		config: Partial<AnimatorPointToPointConfig>,
		type?: string
	) {
		super(node, { ...defaultConfig, ...config }, type);
	}

	protected getTransformMatrix(boundedEased: number): Matrix {
		const move = this._config.startPosition.add(
			this._config.endPosition
				.subtract(this._config.startPosition)
				.multiplyByFloats(boundedEased, boundedEased, boundedEased)
		);
		return Matrix.Identity().setTranslation(move);
	}
}
