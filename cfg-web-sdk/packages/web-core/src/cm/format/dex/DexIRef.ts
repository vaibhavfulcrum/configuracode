import { DexReader, DexSerializable } from "./DexReader";
import { DexRef } from "./DexRef";

export class DexIRef extends DexRef {
	constructor(public reader: DexReader, public pos: number) {
		super(reader);
	}

	load(key?: string): DexSerializable {
		const obj = this.reader.readObjectFromPos(this.pos);

		if (obj instanceof DexRef) {
			return obj.load(key);
		}

		return obj;
	}

	toString() {
		return `DexIRef(${this.reader},${this.pos})`;
	}
}
