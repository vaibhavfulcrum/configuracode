import { Logger } from "@configura/web-utilities";
import { DexInternalizedXRef } from "./DexInternalizedXRef";
import { DexGmImageLoader, DexLoader } from "./DexLoader";
import { DexObj } from "./DexObj";
import { DexReader } from "./DexReader";
import { DexXRefTargetFilter } from "./DexXRefTargetFilter";

export class DexManager {
	loaders = new Map<string, DexLoader>();

	constructor(
		public id: string,
		public urlRoots?: Map<string, string>,
		public xrefTargetFilter = new DexXRefTargetFilter(),
		public readers = new Map<string, DexReader>(),
		defaultLoaders = true
	) {
		if (defaultLoaders) {
			this.defaultLoaders();
		}
	}

	expandRoot(url: string): string {
		if (this.urlRoots === undefined) {
			return url;
		}

		for (const [key, value] of this.urlRoots.entries()) {
			url = url.replace(key, value);
		}

		return url;
	}

	xrefTarget(ref: DexInternalizedXRef) {
		return this.xrefTargetFilter.target(ref);
	}

	loader(suffix: string) {
		return this.loaders.get(suffix);
	}

	defaultLoaders() {
		const suffixes = ["jpg", "jpeg", "bmp", "png"];
		const loader = new DexGmImageLoader();
		for (const suffix of suffixes) {
			this.loaders.set(suffix, loader);
		}
	}

	async load(logger: Logger, url: string, abortSignal?: AbortSignal): Promise<DexObj> {
		const params: RequestInit = {};

		if (abortSignal) {
			params.signal = abortSignal;
		}

		const response = await fetch(url, params);
		if (!response.ok) {
			logger.error(response);
			throw logger.errorAsObject("response not OK!");
		}

		const buffer = await response.arrayBuffer();

		return this.arrayBufferToDexObj(logger, url, buffer);
	}

	arrayBufferToDexObj(logger: Logger, url: string, buffer: ArrayBuffer): DexObj {
		const slice = new Uint8Array(buffer);
		const reader = new DexReader(slice, this, url);

		try {
			reader.begin();
			const root = reader.readRoot();
			if (!(root instanceof DexObj)) {
				throw logger.errorAsObject("root: is not DexObj", root);
			}

			return root;
		} catch (e) {
			logger.errorFromCaught(e);
			throw typeof e === "string" ? Error(e) : e;
		}
	}
}
