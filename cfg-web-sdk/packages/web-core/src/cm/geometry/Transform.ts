import { Matrix33 } from "./Matrix33";
import { Point } from "./Point";

export class Transform {
	constructor(public pos: Point, public mapping?: Matrix33) {}

	add(t: Transform): Transform {
		if (this.mapping !== undefined && t.mapping !== undefined) {
			return new Transform(
				t.pos.add(t.mapping.multiplyByPoint(this.pos)),
				t.mapping.multiply(this.mapping)
			);
		} else if (t.mapping !== undefined) {
			return new Transform(t.pos.add(t.mapping.multiplyByPoint(this.pos)), t.mapping.clone());
		} else if (this.mapping !== undefined) {
			return new Transform(t.pos.add(this.pos), this.mapping.clone());
		} else {
			return new Transform(t.pos.add(this.pos));
		}
	}

	inverted() {
		if (this.mapping) {
			const invMapping = this.mapping.inverted();
			const neg = invMapping.neg();
			const pos = neg.multiplyByPoint(this.pos);
			return new Transform(pos, invMapping);
		}

		return new Transform(new Point(-this.pos.x, -this.pos.y, -this.pos.z));
	}

	toString() {
		let output = `Transform(pos=${this.pos.toString()}`;
		if (this.mapping !== undefined) {
			output += `rot(yaw=${this.mapping.yaw()}, pitch=${this.mapping.pitch()}, roll=${this.mapping.roll()}), scale=${
				this.mapping.scale
			}`;
		}
		return output;
	}

	equals(other: Transform): boolean {
		if (other === undefined) {
			return false;
		}

		if (this === other) {
			return true;
		}

		const thisPos = this.pos;
		const rightPos = other.pos;

		if (!thisPos.equals(rightPos)) {
			return false;
		}

		const thisMapping = this.mapping;
		const rightMapping = other.mapping;

		if ((thisMapping === undefined) !== (rightMapping === undefined)) {
			return false;
		}

		if (
			thisMapping !== undefined &&
			rightMapping !== undefined &&
			!thisMapping.equals(rightMapping)
		) {
			return false;
		}

		return true;
	}
}
