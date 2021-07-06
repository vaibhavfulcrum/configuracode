export class PointF {
	static cast(p: unknown): PointF | undefined {
		if (p instanceof PointF) {
			return p;
		}
	}

	static fcast(p: unknown): PointF {
		if (p instanceof PointF) {
			return p;
		}
		throw Error(`p: ${p} not PointF`);
	}

	constructor(public x: number, public y: number, public z: number) {}

	add(p: PointF) {
		return new PointF(this.x + p.x, this.y + p.y, this.z + p.z);
	}

	clone() {
		return new PointF(this.x, this.y, this.z);
	}

	isPointF() {
		return true;
	}
}
