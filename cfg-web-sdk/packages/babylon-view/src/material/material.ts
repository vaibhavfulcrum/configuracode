import {
	CfgMtrlSourceBuffer,
	CfgMtrlSourceUrl,
	CfgMtrlSourceWithMetaData,
} from "@configura/web-api";
import { GMaterial3D, MultiGMaterial3D } from "@configura/web-core/dist/cm/core3D/GMaterial3D";
import {
	loadMaterialFromUrl,
	makeMaterialFromBuffer,
} from "@configura/web-core/dist/cm/format/cmsym/components/SymGMaterial";
import { LogObservable } from "@configura/web-utilities";
import { getFileExtension } from "@configura/web-utilities/dist/utilitiesFile";
import { RenderEnv } from "../view/RenderEnv";
import { CfgMaterial } from "./CfgMaterial";
import { getTextures, loadTextureFromURL } from "./texture";

export type MaterialMetaData = {
	sourcePath: string[];
	logger: LogObservable;
	multiGMaterial?: MultiGMaterial3D;
	gMaterial?: GMaterial3D;
};

export type MaterialWithMetaData = {
	material: CfgMaterial | undefined;
	meta: MaterialMetaData;
};

function copyMetaData(source: MaterialMetaData, target: MaterialMetaData) {
	const {
		logger: sourceLogger,
		sourcePath: sourceSourcePath,
		multiGMaterial: sourceMultiGMaterial,
		gMaterial: sourceGMaterial,
	} = source;

	const { logger: targetLogger, sourcePath: targetSourcePath } = target;

	sourceLogger.accumulated.forEach((p) => targetLogger.addPrebaked(p));
	targetSourcePath.push(...sourceSourcePath);
	if (sourceMultiGMaterial !== undefined) {
		target.multiGMaterial = sourceMultiGMaterial;
	}
	if (sourceGMaterial !== undefined) {
		target.gMaterial = sourceGMaterial;
	}
}

export async function mtrlSourceToCfgMaterial(
	meta: MaterialMetaData,
	mtrlSourceWithMetaData: CfgMtrlSourceWithMetaData,
	renderEnvironment: RenderEnv
): Promise<CfgMaterial | undefined> {
	const mtrlSource = mtrlSourceWithMetaData.mtrl;
	meta.sourcePath.push("mtrlSourceToCfgMaterial");

	if (mtrlSource instanceof CfgMtrlSourceBuffer) {
		return bufferToCfgMaterial(renderEnvironment, meta, mtrlSource);
	}

	if (mtrlSource instanceof CfgMtrlSourceUrl) {
		return mtrlSourceUrlToCachedCfgMaterial(meta, renderEnvironment, mtrlSource);
	}

	throw meta.logger.errorAsObject("Unsupported mtrlSource");
}

async function mtrlSourceUrlToCachedCfgMaterial(
	meta: MaterialMetaData,
	renderEnvironment: RenderEnv,
	mtrl: CfgMtrlSourceUrl
): Promise<CfgMaterial | undefined> {
	const url = mtrl.url;

	meta.sourcePath.push("mtrlSourceUrlToCachedCfgMaterial");

	const materialWithMetaData = await renderEnvironment.materialCache.get(url, async () => {
		const innerMeta: MaterialMetaData = {
			logger: new LogObservable(),
			sourcePath: [],
		};

		const result: MaterialWithMetaData = {
			material: undefined,
			meta: innerMeta,
		};

		innerMeta.sourcePath.push("cache_url");

		if (!url.startsWith("http")) {
			innerMeta.logger.warn("BAD MTRL URL: ", url);
			return result;
		}

		if (getFileExtension(url) !== "gm") {
			const texture = await loadTextureFromURL(url, renderEnvironment);

			innerMeta.sourcePath.push("image");

			result.material = CfgMaterial.fromTexture(
				renderEnvironment,
				texture,
				innerMeta.sourcePath
			);
			return result;
		}

		const multiGMaterial = await loadMaterialFromUrl(
			innerMeta.logger,
			url,
			renderEnvironment.dexManager
		);

		innerMeta.sourcePath.push("gm");

		result.material = await multiGToCfgMaterial(innerMeta, renderEnvironment, multiGMaterial);

		return result;
	});

	copyMetaData(materialWithMetaData.meta, meta);

	return materialWithMetaData.material;
}

async function bufferToCfgMaterial(
	renderEnvironment: RenderEnv,
	meta: MaterialMetaData,
	mtrl: CfgMtrlSourceBuffer
): Promise<CfgMaterial | undefined> {
	meta.sourcePath.push("bufferToCfgMaterial");

	const fileName = mtrl.fileName;
	const buffer = mtrl.buffer;

	const fileExtension = getFileExtension(fileName);

	if (fileExtension !== "gm") {
		if (fileExtension !== "jpg" && fileExtension !== "jpeg" && fileExtension !== "png") {
			throw meta.logger.errorAsObject("Unsupported file type");
		}

		meta.sourcePath.push("image");

		const texture = await loadTextureFromURL(
			`data:image/${fileExtension};base64,${btoa(
				String.fromCharCode(...new Uint8Array(buffer))
			)}`,
			renderEnvironment
		);

		return CfgMaterial.fromTexture(renderEnvironment, texture, meta.sourcePath);
	}

	const multiGMaterial = makeMaterialFromBuffer(
		meta.logger,
		mtrl.buffer,
		renderEnvironment.dexManager
	);

	meta.sourcePath.push("gm");

	return multiGToCfgMaterial(meta, renderEnvironment, multiGMaterial);
}

export async function gMaterialToCfgMaterial(
	meta: MaterialMetaData,
	renderEnvironment: RenderEnv,
	gMaterial: GMaterial3D
): Promise<CfgMaterial | undefined> {
	meta.sourcePath.push("gMaterialToCfgMaterial");

	const withMetaData = await renderEnvironment.materialCache.get(gMaterial, async () => {
		const innerMeta: MaterialMetaData = {
			logger: new LogObservable(),
			sourcePath: [],
		};

		innerMeta.sourcePath.push("cache_gMaterial");
		innerMeta.gMaterial = gMaterial;

		const textures = await getTextures(innerMeta.logger, renderEnvironment, gMaterial);

		const material = CfgMaterial.compileFromGm(
			renderEnvironment,
			innerMeta,
			gMaterial,
			textures
		);

		return {
			material: material,
			meta: innerMeta,
		};
	});

	copyMetaData(withMetaData.meta, meta);

	return withMetaData.material;
}

async function multiGToCfgMaterial(
	meta: MaterialMetaData,
	renderEnvironment: RenderEnv,
	multiGMaterial: MultiGMaterial3D
): Promise<CfgMaterial | undefined> {
	meta.sourcePath.push("multiGToCfgMaterial");

	if (multiGMaterial instanceof Error) {
		meta.logger.error("error while loading materials", multiGMaterial.message);
		meta.logger.warn(multiGMaterial);
		return;
	}

	meta.multiGMaterial = multiGMaterial;

	const gMaterial = multiGMaterial.renderMaterial();
	if (gMaterial === undefined) {
		return;
	}

	return gMaterialToCfgMaterial(meta, renderEnvironment, gMaterial);
}
