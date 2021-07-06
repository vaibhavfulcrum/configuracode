import { Logger } from "@configura/web-utilities";
import { Matrix33 } from "../../../geometry/Matrix33";
import { Orientation } from "../../../geometry/Orientation";
import { Point } from "../../../geometry/Point";
import { Transform } from "../../../geometry/Transform";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymTransform extends SymComponent {
	id: SymComponentKey = "symTransform";

	originalTransform?: Transform;
	_transform?: Transform;

	constructor(
		public pos?: Point,
		public rot?: Orientation,
		public pivot?: Point,
		public scale = new Point(1, 1, 1),
		src?: string
	) {
		super(src);
	}

	load(logger: Logger, obj: DexObj, env: SymImportEnv, force = false) {
		const pos = obj.get("pos");
		if (pos instanceof Point) {
			this.pos = pos;
		}

		const rot = obj.get("rot");
		if (rot instanceof Orientation) {
			this.rot = rot;
		}

		const scale = obj.get("scale");
		if (scale instanceof Point) {
			this.scale = scale;
		}

		const pivot = obj.get("pivot");
		if (pivot instanceof Point) {
			this.pivot = pivot;
		}

		const transform = obj.get("originalTransform");
		if (transform instanceof Transform) {
			this.originalTransform = transform;
		}
	}

	transform() {
		if (this._transform !== undefined) {
			return this._transform;
		}

		let transform = this.totalTransform();

		if (this.originalTransform !== undefined) {
			transform = this.originalTransform.add(transform);
		}

		this._transform = transform;
		return this._transform;
	}

	rotToMatrix33() {
		if (this.rot === undefined) return;
		const { yaw, pitch, roll } = this.rot;
		const siny = Math.sin(yaw.radians);
		const cosy = Math.cos(yaw.radians);
		const sinp = Math.sin(pitch.radians);
		const cosp = Math.cos(pitch.radians);
		const sinr = Math.sin(roll.radians);
		const cosr = Math.cos(roll.radians);

		const c0 = new Point(cosy * cosp, siny * cosp, -sinp);
		const c1 = new Point(
			cosy * sinp * sinr - siny * cosr,
			siny * sinp * sinr + cosy * cosr,
			cosp * sinr
		);
		const c2 = new Point(
			cosy * sinp * cosr + siny * sinr,
			siny * sinp * cosr - cosy * sinr,
			cosp * cosr
		);

		return new Matrix33(c0, c1, c2);
	}

	scaleToMatrix33() {
		const c0 = new Point(this.scale.x, 0, 0);
		const c1 = new Point(0, this.scale.y, 0);
		const c2 = new Point(0, 0, this.scale.z);

		return new Matrix33(c0, c1, c2);
	}

	totalTransform() {
		let transform: Transform;
		let pos = new Point(0, 0, 0);
		if (this.pivot !== undefined && this.pos !== undefined) {
			pos = this.pivot.add(this.pos);
		} else if (this.pos !== undefined) {
			pos = this.pos;
		} else if (this.pivot !== undefined) {
			pos = this.pivot;
		}

		let mapping;
		const m1 = this.rotToMatrix33();
		const m2 = this.scaleToMatrix33();
		if (m1 !== undefined && m2 !== undefined) {
			mapping = m1.multiply(m2);
		} else if (m1 !== undefined) {
			mapping = m1;
		} else if (m2 !== undefined) {
			mapping = m2;
		}

		transform = new Transform(pos, mapping);

		if (this.pivot !== undefined) {
			const t1 = new Transform(this.pivot);
			const inverted = t1.inverted();
			transform = inverted.add(transform);
		}

		return transform;
	}
}
