import { DexReader } from "./DexReader";

export enum DexXRefStyle {
	External,
	Internal,
	Anonymous,
}

export class DexXRef {
	constructor(
		public reader: DexReader,
		public url: string,
		public path?: string,
		public internalizedKey?: string,
		public style?: DexXRefStyle
	) {}

	load(key: string) {
		let localUrl = this.target();
		const xref = this.internalizedKey
			? this.reader.internalizedXRef(this.internalizedKey)
			: undefined;
		if (xref !== undefined) {
			const filename = xref.createLocalFile(this.reader);
			localUrl = this.forwardSlashed(filename);
		}
		const fileExtension = getFileExtension(localUrl);
		const loader = this.reader.manager.loader(fileExtension);
		if (loader === undefined) {
			throw Error(`no loader for suffix: ${fileExtension}`);
		}
		const obj = loader.load(this.reader, localUrl, this.path);
		this.reader.putReplaceXRef(obj, key, this);
		return obj;
	}

	forwardSlashed(s: string) {
		return s.replace("\\", "/");
	}

	relativeUrl() {
		if (this.url === undefined) {
			throw Error("[DexXRef.relativeUrl] this.url is not defined");
		}
		return this.url.startsWith("../");
	}

	target() {
		const relativeUrl = this.relativeUrl();
		return relativeUrl
			? this.reader.expandRelativeUrl(this.url)
			: this.reader.manager.expandRoot(this.url);
	}
}
function getFileExtension(filename: string) {
	return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1);
}
