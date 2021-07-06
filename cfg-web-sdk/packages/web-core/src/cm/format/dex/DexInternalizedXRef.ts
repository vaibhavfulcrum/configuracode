import { DexReader } from "./DexReader";
import { DexXRefStyle } from "./DexXRef";

export class DexInternalizedXRef {
	localFileCreated: boolean = false;
	style: DexXRefStyle;

	constructor(
		public id: number,
		public xrefCount: number,
		public pos: number,
		public fileSize: number,
		public url: string,
		style: string,
		public hashId: string,
		public encoding: string,
		public hash: string
	) {
		switch (style) {
			case "anonymous":
				this.style = DexXRefStyle.Anonymous;
				break;
			case "internal":
				this.style = DexXRefStyle.Internal;
				break;
			case "external":
				this.style = DexXRefStyle.External;
				break;
			default:
				throw new Error("[DexInternalizedXRef] invalid style: " + style);
		}
	}

	target(): string {
		switch (this.style) {
			case DexXRefStyle.Anonymous:
				const filename = this.url.slice(this.url.lastIndexOf("/") + 1);
				return this.hash + "." + this.hashId + "." + this.encoding + "." + filename;
			case DexXRefStyle.Internal:
				return this.url;
			default:
				throw Error("[DexInternalizedXRef.target] invalid style: " + this.style);
		}
	}

	xrefStyle() {
		return this.style;
	}

	// Desktop implementation returns url to new file on disk
	// Instead return a buffer here
	// TODO: let the reader take care of this
	createLocalFile(reader: DexReader) {
		const manager = reader.manager;
		let url = manager.xrefTarget(this);
		url = manager.expandRoot(url);
		if (this.localFileCreated) {
			return url;
		}

		if (!reader.isOpen) {
			throw Error("reader not open");
		}

		const slice = reader.readInternalizedXRefFile(this.pos, this.fileSize);

		// TODO: verify hash

		new DexReader(slice, reader.manager, url);
		this.localFileCreated = true;

		return url;
	}

	toString() {
		return `DexInternalizedXRef()`;
	}
}
