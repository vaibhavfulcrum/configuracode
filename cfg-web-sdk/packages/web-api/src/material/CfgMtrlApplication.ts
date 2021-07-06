import { ApplicationArea, MtrlApplication } from "../CatalogueAPI";
import { CfgMtrlSource, CfgMtrlSourceBuffer, CfgMtrlSourceUrl } from "./CfgMtrlSource";
import { CfgMtrlApplicationSource } from "./CfgMtrlApplicationSource";

export class CfgMtrlApplication {
	public static fromUrlForDebug(areaTags: string[], url: string): CfgMtrlApplication {
		return CfgMtrlApplication.fromMtrlSourceForDebug(
			areaTags,
			new CfgMtrlSourceUrl(url, "debug")
		);
	}

	public static fromBufferForDebug(
		areaTags: string[],
		fileName: string,
		buffer: ArrayBuffer
	): CfgMtrlApplication {
		return CfgMtrlApplication.fromMtrlSourceForDebug(
			areaTags,
			new CfgMtrlSourceBuffer(fileName, buffer)
		);
	}

	private static fromMtrlSourceForDebug(
		areaTags: string[],
		mtrlSource: CfgMtrlSource
	): CfgMtrlApplication {
		const ts = areaTags.filter((t) => t.trim() !== "");
		if (ts.length === 0) {
			throw Error("No tags");
		}

		return new CfgMtrlApplication(
			CfgMtrlApplicationSource.Debug,
			areaTags,
			mtrlSource,
			undefined
		);
	}

	public static fromApplicationArea(applicationArea: ApplicationArea): CfgMtrlApplication {
		return CfgMtrlApplication.fromMtrlLikeApplication(
			CfgMtrlApplicationSource.ApplicationArea,
			applicationArea
		);
	}

	public static fromMtrlApplication(
		source: CfgMtrlApplicationSource,
		mtrlApplication: MtrlApplication
	): CfgMtrlApplication {
		return CfgMtrlApplication.fromMtrlLikeApplication(source, mtrlApplication);
	}

	private static fromMtrlLikeApplication(
		source: CfgMtrlApplicationSource,
		application: ApplicationArea | MtrlApplication
	): CfgMtrlApplication {
		const materialUrl = application.material;
		const previewUrl = application.preview;

		const url = materialUrl || previewUrl;
		const urlIsFromProperty = materialUrl ? "material" : "preview";
		const mtrl = url ? new CfgMtrlSourceUrl(url, urlIsFromProperty) : undefined;

		return new CfgMtrlApplication(source, application.areas, mtrl, previewUrl);
	}

	private constructor(
		private _source: CfgMtrlApplicationSource,
		private _areaTags: string[] | undefined,
		private _mtrl: CfgMtrlSource | undefined,
		private _previewUrl: string | undefined
	) {}

	public get source(): CfgMtrlApplicationSource {
		return this._source;
	}

	public get areaTags(): string[] | undefined {
		return this._areaTags;
	}

	public get mtrl(): CfgMtrlSource | undefined {
		return this._mtrl;
	}

	public get previewUrl(): string | undefined {
		return this._previewUrl;
	}
}
