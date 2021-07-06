import { DexSerializable } from "./DexReader";
import { DexXRef } from "./DexXRef";

export class DexReplacedXRefs {
	xrefs: Map<DexSerializable, Map<string, DexXRef>>;

	constructor() {
		this.xrefs = new Map();
	}

	get(obj: DexSerializable, k: string) {
		const krefs = this.xrefs.get(obj);
		if (krefs !== undefined) {
			return krefs.get(k);
		}
	}

	put(obj: DexSerializable, k: string, xref: DexXRef) {
		let krefs = this.xrefs.get(obj);
		if (krefs !== undefined) {
			krefs.set(k, xref);
		} else {
			krefs = new Map<string, DexXRef>();
			krefs.set(k, xref);
			this.xrefs.set(obj, krefs);
		}
	}
}
