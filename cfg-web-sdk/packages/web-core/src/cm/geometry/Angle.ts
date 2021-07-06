import { Point2D } from "./Point2D";

export class Angle {
	static fromPoint2D(p: Point2D): Angle {
		return new Angle((Math.atan2(p.y, p.x) + 2 * Math.PI) % (2 * Math.PI));
	}

	static fromDegrees(d: number): Angle {
		const rad = (d * Math.PI) / 180 + ((8 * 2 * Math.PI) % (2 * Math.PI));

		return new Angle(rad);
	}

	constructor(public radians: number) {}

	toString() {
		return `Angle(${this.radians})`;
	}

	sub(a: Angle) {
		return new Angle((this.radians - a.radians + 8 * 2 * Math.PI) % (2 * Math.PI));
	}
}
