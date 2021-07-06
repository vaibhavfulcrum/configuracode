import { ColorF } from "../basic/ColorF";
import { DexObj } from "../format/dex/DexObj";
import { DexSerializable } from "../format/dex/DexReader";
import { DexURL } from "../format/dex/DexURL";
import { DexXRef } from "../format/dex/DexXRef";
import { AngleF } from "../geometry/AngleF";

// tslint:disable:max-classes-per-file

export enum TextureWrap {
	repeat,
	mirroredRepeat,
	clamp,
	clampToEdge,
	clampToBorder,
}

function toTextureWrap(s: string) {
	switch (s) {
		case "repeat":
			return TextureWrap.repeat;
		case "mirroredRepeat":
			return TextureWrap.mirroredRepeat;
		case "clamp":
			return TextureWrap.clamp;
		case "clampToEdge":
			return TextureWrap.clampToEdge;
		case "clampToBorder":
			return TextureWrap.clampToBorder;
		default:
			return TextureWrap.repeat;
	}
}

export class GMaterialProp3D {
	public c?: ColorF;

	public _avgTextureColor?: ColorF;
	public textureCacheKey?: string;

	// UV controls
	public uScale?: number;
	public vScale?: number;
	public uOffset?: number;
	public vOffset?: number;
	public rot?: AngleF;

	public wrap?: TextureWrap;
	public textureUrl?: DexURL;

	setTextureUrl(url: DexURL) {
		if (url !== this.textureUrl) {
			this.textureUrl = url;
			this._avgTextureColor = undefined;
		}
	}
}

export class Diffuse3D extends GMaterialProp3D {
	constructor(public amount = 1) {
		super();
	}
}

export class Ambient3D extends GMaterialProp3D {
	constructor(public amount = 1) {
		super();
	}
}

export class Emission3D extends GMaterialProp3D {}

export class Specular3D extends GMaterialProp3D {
	constructor(public exponent?: number, public amount = 1) {
		super();
	}
}

export class Transparency3D extends GMaterialProp3D {
	constructor(public alphaThreshold?: number, public opacity?: number) {
		super();
	}
}

export class Reflection3D extends GMaterialProp3D {
	constructor(public amount?: number) {
		super();
	}
}

export class Refraction3D extends GMaterialProp3D {
	constructor(public index?: number) {
		super();
	}
}

export class Bump3D extends GMaterialProp3D {
	constructor(public amount?: number, public effectRR?: number, public prepared?: boolean) {
		super();
	}
}

export class GMaterial3D {
	public materialKey?: string;
	public diffuse?: Diffuse3D;
	public ambient?: Ambient3D;
	public specular?: Specular3D;
	public transparency?: Transparency3D;
	public reflection?: Reflection3D;
	public refraction?: Refraction3D;
	public bump?: Bump3D;
	public emission?: Emission3D;

	public doubleSided = false;
	public solid = false;
	public fresnel = false;
	public misc?: Map<string, DexSerializable>;
	public redCustomProperties?: Map<string, DexSerializable>;
}

export function readBaseMaterialProps(prop: GMaterialProp3D, obj: DexObj) {
	if (obj.has("imageUrl")) {
		const url = obj.get("imageUrl");
		if (url instanceof DexURL) {
			prop.setTextureUrl(url);
			prop._avgTextureColor = obj.get("avgTextureColor") as ColorF;
		} else if (url instanceof DexObj) {
			const dexURL = url.get("url");
			if (!(dexURL instanceof DexURL)) {
				throw Error("[readBaseMaterialProps(DexObj)] dexURL not instanceof DexURL");
			}
			prop.setTextureUrl(dexURL);
		} else if (url instanceof DexXRef) {
			const dexURL = url.url !== undefined ? url.load(url.url) : undefined;
			if (!(dexURL instanceof DexURL)) {
				throw Error("[readBaseMaterialProps(DexXRef)] dexURL not instanceof DexURL");
			}
			prop.setTextureUrl(dexURL);
		} else {
			throw Error("[readBaseMaterialProps] Missing dexImageUrl");
		}
	}

	prop.c = obj.get("c") as ColorF;
	prop.uScale = obj.get("uScale") as number;
	prop.vScale = obj.get("vScale") as number;
	prop.uOffset = obj.get("uOffset") as number;
	prop.vOffset = obj.get("vOffset") as number;
	prop.rot = obj.get("rot") as AngleF;
	const tWrap = obj.get("wrap");
	if (typeof tWrap === "string") {
		prop.wrap = toTextureWrap(tWrap);
	}
}

export class MultiGMaterial3D {
	public gmFile?: string;

	constructor(
		public materialMap = new Map<string, GMaterial3D>(),
		realtimeMaterial3D?: GMaterial3D,
		renderMaterial3D?: GMaterial3D
	) {
		if (realtimeMaterial3D !== undefined) {
			this.materialMap.set("medium", realtimeMaterial3D);
		}
		if (renderMaterial3D !== undefined) {
			this.materialMap.set("super", renderMaterial3D);
		}
	}

	realtimeMaterial() {
		return this.materialMap.get("medium");
	}

	renderMaterial() {
		return this.materialMap.get("super");
	}
}
