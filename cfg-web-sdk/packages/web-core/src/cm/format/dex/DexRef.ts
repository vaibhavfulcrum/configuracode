import { DexReader, DexSerializable } from "./DexReader";

export class DexRef {
	constructor(public reader: DexReader) {}

	load(key?: string): DexSerializable | Error {
		throw Error("DexRef.load called on base class");
	}
}
