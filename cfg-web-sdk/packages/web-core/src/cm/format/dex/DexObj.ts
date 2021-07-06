import { DexReader, DexSerializable } from "./DexReader";
import { DexRef } from "./DexRef";

export class DexObj {
	static cast(obj: unknown): DexObj | undefined {
		if (obj instanceof DexObj) {
			return obj;
		}
	}

	static fcast(obj: unknown): DexObj {
		if (obj instanceof DexObj) {
			return obj;
		}
		throw Error(`obj: ${obj} not DexObj`);
	}

	static withReader(reader: DexReader) {
		return new DexObj(undefined, undefined, undefined, reader);
	}

	constructor(
		public type?: string,
		public id?: string,
		public props: Map<string, DexSerializable> = new Map(),
		public reader?: DexReader
	) {}

	// dexType() {
	// 	return DexTypeId.DexObj;
	// }

	// manager(): DexManager | undefined {
	// 	return this.reader ? this.reader.manager : undefined;
	// }

	put(key: string, value: DexSerializable) {
		this.props.set(key, value);
	}

	has(key: string) {
		return this.props.get(key) !== undefined;
	}

	// _getPath(paths: string[]) {
	// 	let entity: DexEntity | undefined = this;
	// 	for (const path of paths) {
	// 		const a: DexObj | undefined = entity instanceof DexObj ? entity : undefined;
	// 		if (!a) {
	// 			return;
	// 		}
	// 		const entityAtPath = a.get(path);
	// 		if (entityAtPath instanceof DexEntity) {
	// 			entity = entityAtPath;
	// 		}
	// 	}

	// 	return entity;
	// }

	// getPathFromPaths(paths: string[]) {
	// 	return this._getPath(paths);
	// }

	// getPath(k: string) {
	// 	const delimiter = ".";
	// 	if (k.slice(0, 1) === delimiter) {
	// 		return Error("[DexObj.getPath] path may not begin with a delimiter");
	// 	}

	// 	return this._getPath(k.split(delimiter));
	// }

	get(key: string): DexSerializable | undefined {
		// if (this.reader) {
		// 	this.reader.setAccessed();
		// }

		const entity = this.props.get(key);
		if (entity === undefined) {
			return;
		}

		if (entity instanceof DexRef) {
			const value = entity.load(key);
			this.props.set(key, value);
			return value;
		}

		return entity;
	}

	loadAll(visited: DexObj[] = []) {
		if (visited.indexOf(this) !== -1) {
			return;
		}

		visited.push(this);

		for (const key of this.props.keys()) {
			const entity = this.get(key);
			if (entity instanceof Error) {
				return entity;
			} else if (entity instanceof DexObj) {
				entity.loadAll(visited);
			}
		}
	}

	// toString() {
	// 	return "DexObj(" + this.type + ")";
	// }
}
