import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";

export class CfgBoundingBox {
	public minimum: Vector3;
	public maximum: Vector3;

	constructor(minimum?: Vector3, maximum?: Vector3) {
		this.minimum = minimum?.clone() || Vector3.Zero();
		this.maximum = maximum?.clone() || Vector3.Zero();
		this._isEmpty = minimum === undefined && maximum === undefined;
	}

	/// Means that the bounding box should be seen as "undefined", which is not the same as "zero".
	private _isEmpty = true;

	reConstruct(minimum: Vector3, maximum: Vector3): CfgBoundingBox {
		this.minimum.copyFrom(minimum);
		this.maximum.copyFrom(maximum);
		this._isEmpty = false;
		return this;
	}

	copyFrom(otherBoundingBox: CfgBoundingBox): CfgBoundingBox {
		this.reConstruct(otherBoundingBox.minimum, otherBoundingBox.maximum);
		this._isEmpty = otherBoundingBox.isEmpty;
		return this;
	}

	clone(): CfgBoundingBox {
		return new CfgBoundingBox(this.minimum, this.maximum);
	}

	get center(): Vector3 {
		return Vector3.Center(this.minimum, this.maximum);
	}

	translate(vec: Vector3): CfgBoundingBox {
		this.minimum.addInPlace(vec);
		this.maximum.addInPlace(vec);
		return this;
	}

	expand(otherBoundingBox: CfgBoundingBox): CfgBoundingBox {
		if (otherBoundingBox.isEmpty) {
			return this;
		}

		if (this.isEmpty) {
			this.reConstruct(otherBoundingBox.minimum, otherBoundingBox.maximum);
			return this;
		}

		this.reConstruct(
			this.minimum.minimizeInPlace(otherBoundingBox.minimum),
			this.maximum.maximizeInPlace(otherBoundingBox.maximum)
		);

		return this;
	}

	applyMatrix(matrix: Matrix): CfgBoundingBox {
		if (this.isEmpty) {
			return this;
		}

		// Transform can be rotation, in which case we might need to re-minimize/maximize
		const transformedMin = Vector3.TransformCoordinates(this.minimum, matrix);
		const transformedMax = Vector3.TransformCoordinates(this.maximum, matrix);
		this.reConstruct(
			transformedMin.clone().minimizeInPlace(transformedMax),
			transformedMax.maximizeInPlace(transformedMin)
		);

		return this;
	}

	get spaceDiagonal(): number {
		if (this.isEmpty) {
			return 0;
		}
		const minimum = this.minimum.asArray();
		const maximum = this.maximum.asArray();

		return Math.sqrt(minimum.reduce((a, c, i) => a + Math.pow(maximum[i] - c, 2)));
	}

	get isEmpty() {
		return this._isEmpty;
	}
}
