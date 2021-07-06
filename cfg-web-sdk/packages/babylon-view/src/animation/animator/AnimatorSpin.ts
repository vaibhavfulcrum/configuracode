import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorEasingMatrix,
	AnimatorEasingMatrixConfig,
	getDefaultConfig as baseGetDefaultConfig,
} from "./AnimatorEasingMatrix";

export type AnimatorSpinConfig = AnimatorEasingMatrixConfig<number> & { rotationAxis: Vector3 };

const defaultConfig: AnimatorSpinConfig = {
	...baseGetDefaultConfig<number>(0),
	rotationAxis: new Vector3(0, 1, 0),
};

export class AnimatorSpin extends AnimatorEasingMatrix<number, AnimatorSpinConfig> {
	constructor(node: AnimatableObject, config: Partial<AnimatorSpinConfig>, type?: string) {
		super(node, { ...defaultConfig, ...config }, type);
	}

	protected getTransformMatrix(boundedEased: number): Matrix {
		const spin =
			this._config.startPosition +
			(this._config.endPosition - this._config.startPosition) * boundedEased;

		return Matrix.RotationAxis(this._config.rotationAxis, spin);
	}
}
