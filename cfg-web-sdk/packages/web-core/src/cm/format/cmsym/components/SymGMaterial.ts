import { Logger } from "@configura/web-utilities";
import {
	Ambient3D,
	Bump3D,
	Diffuse3D,
	GMaterial3D,
	MultiGMaterial3D,
	readBaseMaterialProps,
	Reflection3D,
	Refraction3D,
	Specular3D,
	Transparency3D,
} from "../../../core3D/GMaterial3D";
import { DexManager } from "../../dex/DexManager";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymGMaterial extends SymComponent {
	id: SymComponentKey = "symGMaterial";
	gm?: GMaterial3D;

	load(logger: Logger, dexObj: DexObj, _env: SymImportEnv) {
		const result = this.dexNodeMaterial(logger, dexObj);
		if (result === undefined) {
			throw logger.errorAsObject("bad material");
		}
		this.gm = result;
	}

	dexNodeMaterial(logger: Logger, obj: DexObj): GMaterial3D | undefined {
		const material = obj.get("gm");
		if (material instanceof GMaterial3D) {
			return material;
		} else if (material instanceof DexObj && material.type === "gm") {
			return dexToGMaterial3D(logger, material);
		}
		throw logger.errorAsObject("Unknown SymGMaterial object:", material);
	}
}

export function dexToGMaterial3D(logger: Logger, obj: DexObj): GMaterial3D {
	if (obj.type !== "gm") {
		throw logger.errorAsObject("bad obj.type:", obj.type);
	}
	let property;
	const gm = new GMaterial3D();

	property = obj.get("materialKey");
	if (typeof property === "string") {
		gm.materialKey = property;
	}

	property = obj.get("diffuse");
	if (property instanceof DexObj) {
		gm.diffuse = new Diffuse3D();
		readBaseMaterialProps(gm.diffuse, property);
		const amount = property.get("amount");
		if (typeof amount === "number") {
			gm.diffuse.amount = amount;
		}
	}

	property = obj.get("ambient");
	if (property instanceof DexObj) {
		gm.ambient = new Ambient3D();
		readBaseMaterialProps(gm.ambient, property);
		const amount = property.get("amount");
		if (typeof amount === "number") {
			gm.ambient.amount = amount;
		}
	}

	property = obj.get("specular");
	if (property instanceof DexObj) {
		gm.specular = new Specular3D();
		readBaseMaterialProps(gm.specular, property);
		const amount = property.get("amount");
		const exponent = property.get("exponent");
		if (typeof amount === "number") {
			gm.specular.amount = amount;
		}
		if (typeof exponent === "number") {
			gm.specular.exponent = exponent;
		}
	}

	property = obj.get("transparency");
	if (property instanceof DexObj) {
		const alpha = property.get("alphaThreshold");
		if (alpha !== undefined && typeof alpha !== "number") {
			throw logger.errorAsObject("bad alpha:", alpha);
		}

		const opacity = property.get("opacity");
		if (opacity !== undefined && typeof opacity !== "number") {
			throw logger.errorAsObject("bad opacity:", opacity);
		}
		gm.transparency = new Transparency3D(alpha, opacity);
		readBaseMaterialProps(gm.transparency, property);
	}

	property = obj.get("reflection");
	if (property instanceof DexObj) {
		gm.reflection = new Reflection3D();
		readBaseMaterialProps(gm.reflection, property);
		const amount = property.get("amount");
		if (typeof amount === "number") {
			gm.reflection.amount = amount;
		}
	}

	property = obj.get("refraction");
	if (property instanceof DexObj) {
		// TODO Babylon: Babylon supports refraction to some extent, see if this can be used.

		gm.refraction = new Refraction3D();
		readBaseMaterialProps(gm.refraction, property);
		const index = property.get("index");
		if (typeof index === "number") {
			gm.refraction.index = index;
		}
	} else if (property !== undefined) {
		logger.warn("material property 'refraction' is of an unexpected type", property);
	}

	property = obj.get("bump");
	if (property instanceof DexObj) {
		gm.bump = new Bump3D();
		readBaseMaterialProps(gm.bump, property);
		const amount = property.get("amount");
		const bumpEffectRR = property.get("effectRR");
		const texturePrepared = property.get("prepared");
		if (typeof amount === "number") {
			gm.bump.amount = amount;
		}
		if (typeof bumpEffectRR === "number") {
			gm.bump.effectRR = bumpEffectRR;
		}
		if (typeof texturePrepared === "boolean") {
			gm.bump.prepared = texturePrepared;
		}
	} else if (property !== undefined) {
		logger.warn("material property 'bump' is of an unexpected type", property);
	}

	const doubleSided = obj.get("doubleSided");
	if (typeof doubleSided === "boolean") {
		gm.doubleSided = doubleSided;
	}

	const solid = obj.get("solid");
	if (typeof solid === "boolean") {
		gm.solid = solid;
	}

	property = obj.get("fresnel");
	if (typeof property === "boolean" && property === true) {
		// TODO Babylon: Babylon has fresnel options, look into hot to map them
		logger.warn("material uses 'fresnel' which is not yet supported", property);
	}

	property = obj.get("misc");
	if (property instanceof DexObj) {
		gm.misc = property.props;
	} else if (property !== undefined) {
		logger.warn("material property 'misc' is of an unexpected type", property);
	}

	property = obj.get("redCustomProperties");
	if (property instanceof DexObj) {
		gm.redCustomProperties = property.props;
	} else if (property !== undefined) {
		logger.warn("material property 'redCustomProperties' is of an unexpected type", property);
	}

	return gm;
}

export function dexToMultiGMaterial3D(logger: Logger, obj: DexObj) {
	const multiMaterial = new MultiGMaterial3D();
	if (obj.type === "multiMaterial") {
		for (const key of obj.props.keys()) {
			const prop = obj.get(key);
			if (!(prop instanceof DexObj)) {
				throw logger.errorAsObject(`obj.${key}: ${prop} != DexObj`);
			}
			if (prop.type !== "gm") {
				continue;
			}
			const material = dexToGMaterial3D(logger, prop);
			multiMaterial.materialMap.set(key, material);
		}
		return multiMaterial;
	} else if (obj.type === "gm") {
		const material = dexToGMaterial3D(logger, obj);
		multiMaterial.materialMap.set("super", material);
		return multiMaterial;
	} else {
		throw logger.errorAsObject("unknown obj.type:", obj.type);
	}
}

export async function loadMaterialFromUrl(
	logger: Logger,
	url: string,
	dexManager: DexManager,
	abortSignal?: AbortSignal
): Promise<MultiGMaterial3D> {
	const root = await dexManager.load(logger, url, abortSignal);
	return finishMaterial(logger, url, root);
}

export function makeMaterialFromBuffer(
	logger: Logger,
	buffer: ArrayBuffer,
	dexManager: DexManager
): MultiGMaterial3D {
	const root = dexManager.arrayBufferToDexObj(logger, "", buffer);
	return finishMaterial(logger, "", root);
}

function finishMaterial(logger: Logger, url: string, dex: DexObj): MultiGMaterial3D {
	const material = dexToMultiGMaterial3D(logger, dex);
	material.gmFile = url;
	return material;
}
