import { Point2D } from "./Point2D";

export class Point {
	static cast(p: unknown): Point | undefined {
		if (p instanceof Point) {
			return p;
		}
	}

	static fcast(p: unknown): Point {
		if (p instanceof Point) {
			return p;
		}
		throw Error(`p: ${p} not Point`);
	}

	constructor(public x: number, public y: number, public z: number) {}

	equals(other: Point) {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}

	getByNumber(n: number) {
		switch (n) {
			case 0:
				return this.x;
			case 1:
				return this.y;
			case 2:
				return this.z;
			default:
				throw Error(`Not a valid number to access by: ${n}`);
		}
	}

	dividByNumber(n: number) {
		return new Point(this.x / n, this.y / n, this.z / n);
	}

	add(p: Point) {
		return new Point(this.x + p.x, this.y + p.y, this.z + p.z);
	}

	length() {
		const { x, y, z } = this;
		return Math.sqrt(x * x + y * y + z * z);
	}

	clone() {
		return new Point(this.x, this.y, this.z);
	}

	toPoint2D(): Point2D {
		return new Point2D(this.x, this.y);
	}

	isPoint() {
		return true;
	}

	toString() {
		return `(${this.x}, ${this.y}, ${this.z})`;
	}
}
