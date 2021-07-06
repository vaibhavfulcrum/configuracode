export class Point2D {
	static cast(p: unknown): Point2D | undefined {
		if (p instanceof Point2D) {
			return p;
		}
	}

	static fcast(p: unknown): Point2D {
		if (p instanceof Point2D) {
			return p;
		}
		throw Error(`p: ${p} not Point2D`);
	}

	constructor(public x: number, public y: number) {}

	isPoint2D() {
		return true;
	}
}
