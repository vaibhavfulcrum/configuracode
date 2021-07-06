import { DexReader, DexSerializable } from "./DexReader";
import { DexURL } from "./DexURL";

// tslint:disable:max-classes-per-file
export class DexLoader {
	load(reader: DexReader, url: string, path?: string): DexSerializable {
		throw Error("default loader not implemented");
	}
}

export class DexGmImageLoader extends DexLoader {
	load(reader: DexReader, url: string, path?: string) {
		return new DexURL(url);
	}
}
