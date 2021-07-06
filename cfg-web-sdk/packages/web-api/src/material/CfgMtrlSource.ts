export abstract class CfgMtrlSource {
	public abstract isSame(other: CfgMtrlSource): boolean;
}

export class CfgMtrlSourceUrl extends CfgMtrlSource {
	constructor(private _url: string, private _urlIsFromProperty: string) {
		super();
	}

	public get url(): string {
		return this._url;
	}

	public get urlIsFromProperty(): string {
		return this._urlIsFromProperty;
	}

	public isSame(other: CfgMtrlSource): boolean {
		if (!(other instanceof CfgMtrlSourceUrl)) {
			return false;
		}
		return this.url === other.url;
	}
}

export class CfgMtrlSourceBuffer extends CfgMtrlSource {
	constructor(private _fileName: string, private _buffer: ArrayBuffer) {
		super();
	}

	public get fileName(): string {
		return this._fileName;
	}

	public get buffer(): ArrayBuffer {
		return this._buffer;
	}

	public isSame(other: CfgMtrlSource): boolean {
		if (!(other instanceof CfgMtrlSourceBuffer)) {
			return false;
		}
		return this.fileName === other.fileName;
	}
}
