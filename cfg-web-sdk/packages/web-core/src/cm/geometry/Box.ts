import { Point } from "./Point";

export class Box {
	constructor(public p0: Point, public p1: Point) {}

	toString() {
		return `Box(p0=${this.p0}, p1=${this.p1})`;
	}
}
