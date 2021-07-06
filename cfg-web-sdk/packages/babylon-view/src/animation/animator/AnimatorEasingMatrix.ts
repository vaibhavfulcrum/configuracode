import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorEasing,
	AnimatorEasingConfig,
	getDefaultConfig as baseGetDefaultConfig,
} from "./AnimatorEasing";

export type AnimatorEasingMatrixConfig<T> = AnimatorEasingConfig<T> & {
	translationVector: Vector3;
};

export function getDefaultConfig<T>(empty: T): AnimatorEasingMatrixConfig<T> {
	return {
		...baseGetDefaultConfig<T>(empty),
		translationVector: new Vector3(),
	};
}

export abstract class AnimatorEasingMatrix<
	T,
	Config extends AnimatorEasingMatrixConfig<T>
> extends AnimatorEasing<T, Config> {
	private _translateMatrix: Matrix;
	private _translateInverseMatrix: Matrix;

	constructor(node: AnimatableObject, config: Config, type?: string | undefined) {
		super(node, config, type);

		this._translateMatrix = Matrix.Translation(
			config.translationVector.x,
			config.translationVector.y,
			config.translationVector.z
		);

		this._translateInverseMatrix = Matrix.Translation(
			-config.translationVector.x,
			-config.translationVector.y,
			-config.translationVector.z
		);
	}

	protected abstract getTransformMatrix(boundedEased: number): Matrix;

	protected apply(boundedEased: number): void {
		const transformMatrix = this.getTransformMatrix(boundedEased);

		this.node.setPreTransformMatrix(
			this.node.originalMatrix.multiply(
				this._translateInverseMatrix.multiply(
					transformMatrix.multiply(this._translateMatrix)
				)
			)
		);
	}
}
