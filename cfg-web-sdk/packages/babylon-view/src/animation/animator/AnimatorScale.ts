import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorEasingMatrix,
	AnimatorEasingMatrixConfig,
	getDefaultConfig as baseGetDefaultConfig,
} from "./AnimatorEasingMatrix";

export type AnimatorScaleConfig = AnimatorEasingMatrixConfig<number>;

const defaultConfig: AnimatorScaleConfig = baseGetDefaultConfig<number>(0);

export class AnimatorScale extends AnimatorEasingMatrix<number, AnimatorScaleConfig> {
	constructor(node: AnimatableObject, config: Partial<AnimatorScaleConfig>, type?: string) {
		super(node, { ...defaultConfig, ...config }, type);
	}

	protected getTransformMatrix(boundedEased: number): Matrix {
		const scale =
			this._config.startPosition +
			(this._config.endPosition - this._config.startPosition) * boundedEased;

		return Matrix.Scaling(scale, scale, scale);
	}
}
