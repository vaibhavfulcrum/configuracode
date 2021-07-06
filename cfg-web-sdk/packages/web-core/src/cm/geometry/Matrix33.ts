import { eq } from "../basic/number";
import { Angle } from "./Angle";
import { Point } from "./Point";
import { Point2D } from "./Point2D";

/**
 * 3 by 3 Matrix
 *
 * ref: base/dll/geometry
 */
export class Matrix33 {
	constructor(public c0: Point, public c1: Point, public c2: Point) {}

	static identity = new Matrix33(new Point(1, 0, 0), new Point(0, 1, 0), new Point(0, 0, 1));

	equals(other: Matrix33) {
		return this.c0 === other.c0 && this.c1 === other.c1 && this.c2 === other.c2;
	}

	add(m?: Matrix33) {
		if (m === undefined) {
			return this.clone();
		}
		const { c0, c1, c2 } = this;
		return new Matrix33(c0.add(m.c0), c1.add(m.c1), c2.add(m.c2));
	}

	minor(col0: Point, col1: Point, r0: number, r1: number) {
		return (
			col0.getByNumber(r0) * col1.getByNumber(r1) -
			col0.getByNumber(r1) * col1.getByNumber(r0)
		);
	}

	adjoint() {
		return new Matrix33(
			new Point(
				this.minor(this.c1, this.c2, 1, 2),
				-this.minor(this.c0, this.c2, 1, 2),
				this.minor(this.c0, this.c1, 1, 2)
			),
			new Point(
				-this.minor(this.c1, this.c2, 0, 2),
				this.minor(this.c0, this.c2, 0, 2),
				-this.minor(this.c0, this.c1, 0, 2)
			),
			new Point(
				this.minor(this.c1, this.c2, 0, 1),
				-this.minor(this.c0, this.c2, 0, 1),
				this.minor(this.c0, this.c1, 0, 1)
			)
		);
	}

	det() {
		return (
			this.c0.x * this.minor(this.c1, this.c2, 1, 2) -
			this.c1.x * this.minor(this.c0, this.c2, 1, 2) +
			this.c2.x * this.minor(this.c0, this.c1, 1, 2)
		);
	}

	invert() {
		const d = this.det();
		if (d === 0) {
			throw Error(`The determinant is zero: ${d}`);
		}
		const a = this.adjoint();

		return a.dividByNumber(d);
	}

	dividByNumber(n: number) {
		return new Matrix33(
			this.c0.dividByNumber(n),
			this.c1.dividByNumber(n),
			this.c2.dividByNumber(n)
		);
	}

	inverted() {
		const m = this.clone();
		m.invert();
		return m;
	}

	neg() {
		const c0 = new Point(-this.c0.x, -this.c0.y, -this.c0.z);
		const c1 = new Point(-this.c1.x, -this.c1.y, -this.c1.z);
		const c2 = new Point(-this.c2.x, -this.c2.y, -this.c2.z);

		return new Matrix33(c0, c1, c2);
	}

	multiply(m: Matrix33) {
		const c0 = this.multiplyByPoint(m.c0);
		const c1 = this.multiplyByPoint(m.c1);
		const c2 = this.multiplyByPoint(m.c2);

		return new Matrix33(c0, c1, c2);
	}

	multiplyByPoint(p: Point) {
		const { c0, c1, c2 } = this;

		return new Point(
			c0.x * p.x + c1.x * p.y + c2.x * p.z,
			c0.y * p.x + c1.y * p.y + c2.y * p.z,
			c0.z * p.x + c1.z * p.y + c2.z * p.z
		);
	}

	clone(): Matrix33 {
		return new Matrix33(this.c0.clone(), this.c1.clone(), this.c2.clone());
	}

	/**
	 * Returns the yaw angle (rotation around Z-axis) of this matrix if it is a correct
	 * rotation matrix (normalized, orthogonal vectors).
	 * Any way the rotation of the x-coordinate base-vector around the z-axis is returned.
	 */
	yaw() {
		const { c0, c1 } = this;
		if (c0.z < -1 || c0.z > 1 || eq(c0.z, -1) || eq(c0.z, 1)) {
			// Pitch +90 degrees or - 90 degrees -> roll and yaw both rotates around the z-axis.
			// Force roll to zero and let yaw take care of all rotation around the z-axis.

			return Angle.fromPoint2D(c1.toPoint2D()).sub(Angle.fromDegrees(90));
		} else {
			return Angle.fromPoint2D(c0.toPoint2D());
		}
	}

	/**
	 * Returns the pitch angle (angle between x base-vector (c0) and  XY-plane) of this matrix
	 * if it is a correct rotation matrix.
	 */
	pitch() {
		const { c0 } = this;
		if (c0.z < -1) {
			return new Angle(Math.asin(1.0));
		} else if (c0.z > 1) {
			return new Angle(Math.asin(-1.0));
		} else {
			return new Angle(Math.asin(-c0.z));
		}
	}

	/**
	 * Returns the roll angle of this matrix if it is a correct rotation matrix.
	 */
	roll() {
		const { c0, c1, c2 } = this;
		if (c0.z < -1 || c0.z > 1 || eq(c0.z, -1) || eq(c0.z, 1)) {
			// Pitch +90 degrees or - 90 degrees -> roll and yaw both rotates around the z-axis.
			// Force roll to zero and let yaw take care of all rotation around the z-axis.
			return new Angle(0);
		} else {
			const cosp = Math.cos(Math.asin(-c0.z));
			return Angle.fromPoint2D(new Point2D(c2.z / cosp, c1.z / cosp));
		}
	}

	scale() {
		return new Point(this.c0.length(), this.c1.length(), this.c2.length());
	}
}
