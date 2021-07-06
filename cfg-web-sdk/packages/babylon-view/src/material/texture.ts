import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
	Bump3D,
	GMaterial3D,
	GMaterialProp3D,
	TextureWrap,
} from "@configura/web-core/dist/cm/core3D/GMaterial3D";
import { getFileExtension, loadImage, Logger, LogObservable } from "@configura/web-utilities";
import { RenderEnv } from "../view/RenderEnv";

// As these textures are embedded in other files it will never be worthwhile to try again.
// Therefore undefined is an acceptable cache value representing "you will never get an image even
// if you try"
export type TextureImageWithMetaData = {
	image: HTMLImageElement | undefined;
	logger: LogObservable;
};

function getImageMimeType(fileExtension: string): "image/jpeg" | "image/png" | "image/bmp" {
	switch (fileExtension.toLowerCase()) {
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "png":
			return "image/png";
		case "bmp":
			return "image/bmp";
		default:
			throw Error("unrecognized file extension: " + fileExtension);
	}
}

function symWrapToBabylonWrap(logger: Logger, wrap: TextureWrap): number {
	switch (wrap) {
		case TextureWrap.clampToEdge:
			return Texture.CLAMP_ADDRESSMODE;
		case TextureWrap.repeat:
			return Texture.WRAP_ADDRESSMODE;
		case TextureWrap.mirroredRepeat:
			logger.warn("Mirrored repeat wrapping not fully tested.");
			return Texture.MIRROR_ADDRESSMODE;
		case TextureWrap.clamp:
			// From the CmSym specification this sounds like a "clamp to border" with a black
			// or transparent border color, not supported by WebGL or WebGPU.
			throw Error("Clamp wrapping not supported");
		case TextureWrap.clampToBorder:
			// Not supported by WebGL or WebGPU
			throw Error("ClampToBorder wrapping not supported");
		default:
			throw Error("wrapping not implemented");
	}
}

async function loadCachedImage(
	logger: Logger,
	resourceUrl: string,
	renderEnvironment: RenderEnv
): Promise<HTMLImageElement | undefined> {
	const textureImageWithMeta = await renderEnvironment.textureImageCache.get(
		resourceUrl,
		async () => {
			const result: TextureImageWithMetaData = {
				image: undefined,
				logger: new LogObservable(),
			};

			const mimeType = getImageMimeType(getFileExtension(resourceUrl));
			const reader = renderEnvironment.dexManager.readers.get(resourceUrl);
			if (reader === undefined) {
				result.logger.warn("no reader for", resourceUrl);
				return result;
			}

			const bytes = reader.bytes();
			const blob = new Blob([bytes], { type: mimeType });
			const blobImageUrl = window.URL.createObjectURL(blob);

			try {
				result.image = await loadImage(blobImageUrl);
				return result;
			} catch (e) {
				result.logger.warnFromCaught(e);
				return result;
			}
		}
	);

	textureImageWithMeta.logger.accumulated.forEach((p) => logger.addPrebaked(p));
	return textureImageWithMeta.image;
}

export function loadTextureFromURL(url: string, renderEnvironment: RenderEnv) {
	const task = renderEnvironment.assetsManager.addTextureTask("(loadTextureFromURL)", url);

	return new Promise((resolve: (t: Texture) => void, reject) => {
		task.runTask(
			renderEnvironment.scene,
			() => {
				resolve(task.texture);
			},
			reject
		);
	});
}

/// Derives a normal map from a supplied height map. Both are used in CET for bump-maps but Babylon
/// only supports normal maps.
///
/// The derived normal map and the effect from `scale` is carefully crafted to be as similar to how
/// the RedSDK 3D renderer in CET operates and match it's final output. Do not change this code to
/// make it visually "better", the goal is instead to be as similar as possible.
function deriveNormalMapFromHeightMap(
	image: HTMLImageElement,
	amount: number | undefined,
	logger: Logger
): HTMLImageElement {
	const w = image.width;
	const h = image.height;

	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const context = canvas.getContext("2d");
	if (context !== null) {
		const tick = performance.now();
		context.drawImage(image, 0, 0);

		const imgData = context.getImageData(0, 0, image.width, image.height);
		const data = imgData.data;

		// The scale conversion and default value comes from the CET source code.
		const scale = amount ? 15 * amount : 0.1;

		/// Number of components, canvas returns RGBA
		const c = 4;

		// Go through the image and calculate a gray scale version, storing it in the A channel.
		// Since this is legacy support code, we might as well support non-gray scale height maps,
		// which we have seen in the wild. This is also how RedSDK in CET works according to docs.
		for (let i = 0; i < w * h * c; i += c) {
			data[i + 3] = (data[i] + data[i + 1] + data[i + 2]) / 3;
		}

		// Derive the height map to create a normal map, store the X and Y components in the R and
		// G channels respectively.
		//
		// We are assuming that the map will be repeated when displayed since the Material Lab does
		// not expose texture repeats in it's UI, and the default mode is wrapped. This means that
		// edge sampling should wrap around as well.
		for (let i = 0; i < w * h; i++) {
			// The sample kernel:
			// [x][r]
			// [b]
			//
			// Produces results shifted half a pixel diagonally and is very local, but is about the // same as the kernel used in CET's render engine and also OpenGLs derivation extension.
			const offset = i * c + 3; // A channel
			const x = data[offset];
			let r, b;
			if (i % w === w - 1) {
				// End of the row, sample from the beginning of the same row
				r = data[offset - (w - 1) * c];
			} else {
				r = data[offset + c];
			}
			if (i >= (h - 1) * w) {
				// Last row, sample from the same column in the first row
				b = data[offset - (h - 1) * w * c];
			} else {
				b = data[offset + w * c];
			}

			// y-axis is inverted, OpenGL vs DirectX
			const normal = new Vector3((x - r) * scale, (b - x) * scale, 255).normalize();
			data[offset - 3] = Math.max(0, Math.min(255, normal.x * 128 + 127)); // R, x-axis
			data[offset - 2] = Math.max(0, Math.min(255, normal.y * 128 + 127)); // G, y-axis
			data[offset - 1] = Math.max(0, Math.min(255, normal.z * 128 + 127)); // B, z-axis
		}

		// Set the A channel to 255 to avoid any strange edge case and let it compress better.
		for (let offset = 3; offset < w * h * c; offset += c) {
			data[offset] = 255; // A
		}

		context.putImageData(imgData, 0, 0);

		const convertedImage = new Image();
		convertedImage.src = canvas.toDataURL("image/png");

		logger.info(
			`Converting height based bump map`,
			`of size ${w}x${h} took ${Math.round(
				performance.now() - tick
			)}ms. For optimal performance, update all materials to use normal maps rather than height maps.`
		);

		return convertedImage;
	}

	return image;
}

function isGMaterialProp3D(v: unknown): v is GMaterialProp3D {
	return v instanceof GMaterialProp3D;
}

interface GMAndImageLoad {
	gm: GMaterialProp3D;
	im: Promise<HTMLImageElement | undefined>;
}

interface GMAndTextureLoad {
	gm: GMaterialProp3D;
	tx: Promise<Texture | undefined>;
}

export interface GMAndTexture {
	gm: GMaterialProp3D;
	tx?: Texture;
}

function getToImageLoadFunc(logger: Logger, renderEnvironment: RenderEnv) {
	return function (gm: GMaterialProp3D): GMAndImageLoad {
		let im: Promise<HTMLImageElement | undefined>;

		if (gm === undefined || gm.textureUrl === undefined) {
			im = Promise.resolve(undefined);
		} else {
			im = loadCachedImage(logger, gm.textureUrl.value, renderEnvironment);
		}

		return { gm, im };
	};
}

function getApplyImageConversionsFunc(logger: Logger, renderEnvironment: RenderEnv) {
	return function (gmv: GMAndImageLoad): GMAndImageLoad {
		const { gm } = gmv;

		if (gm instanceof Bump3D && !gm.prepared) {
			/* A non-"prepared" bump texture means that the bump map is actually an old school
			 * height map rather than a more modern (and faster) normal map. Babylon.js does not
			 * support height maps so we will need to convert it manually.
			 * https://forum.babylonjs.com/t/old-school-bump-map-height-map-not-supported/13447
			 *
			 * Normal map vs Height map:
			 * https://docs.unity3d.com/2019.3/Documentation/Manual/StandardShaderMaterialParameterNormalMap.html
			 */
			const textureUrl = gm.textureUrl;
			if (textureUrl !== undefined) {
				const mimeType = getImageMimeType(getFileExtension(textureUrl.value));
				if (mimeType === "image/png" || mimeType === "image/jpeg") {
					// Wrap the pure image load promise with an normal map derive promise
					gmv.im = renderEnvironment.derivedNormalMapCache.get(
						textureUrl.value,
						async () => {
							let image = await gmv.im;
							if (image !== undefined) {
								image = deriveNormalMapFromHeightMap(image, gm.amount, logger);
							}

							return image;
						}
					);
				}
			}
		}
		return gmv;
	};
}

function getToTextureLoadFunc(renderEnvironment: RenderEnv) {
	return function (gmv: GMAndImageLoad): GMAndTextureLoad {
		const { gm, im } = gmv;

		const tx = (async () => {
			const image = await im;
			if (image === undefined) {
				return undefined;
			}
			return loadTextureFromURL(image.src, renderEnvironment);
		})();

		return { gm, tx };
	};
}

function getApplyTexturePropertiesFromGMaterialFunc(logger: Logger) {
	return async function (gmv: GMAndTextureLoad): Promise<GMAndTexture> {
		const gm = gmv.gm;
		const tx = await gmv.tx;

		if (tx !== undefined) {
			const { wrap, uScale, vScale, uOffset, vOffset, rot } = gm;

			const babylonWrap =
				wrap !== undefined ? symWrapToBabylonWrap(logger, wrap) : Texture.WRAP_ADDRESSMODE;

			tx.wrapU = babylonWrap;
			tx.wrapV = babylonWrap;

			tx.uScale = uScale ? uScale : 1;
			tx.vScale = vScale ? vScale : 1;
			tx.uOffset = uOffset || 0;
			tx.vOffset = vOffset || 0;
			tx.uRotationCenter = 0;
			tx.vRotationCenter = 0;

			if (rot !== undefined) {
				tx.wAng = rot.radians;
			}
		}

		return { gm, tx };
	};
}

export async function getTextures(
	logger: Logger,
	renderEnvironment: RenderEnv,
	gMaterial: GMaterial3D
) {
	// Ambient is not used in CET.
	// Emissive does no longer exist in CET.
	// Specular is rare (and we can currently only handle its general value,
	// not its texture since the MeshStandardMaterial does not accept such a thing.)

	const texturePromises = [
		gMaterial.bump,
		gMaterial.diffuse,
		gMaterial.specular,
		gMaterial.transparency,
	]
		.filter(isGMaterialProp3D)
		.map(getToImageLoadFunc(logger, renderEnvironment))
		.map(getApplyImageConversionsFunc(logger, renderEnvironment))
		.map(getToTextureLoadFunc(renderEnvironment))
		.map(getApplyTexturePropertiesFromGMaterialFunc(logger));

	return await Promise.all(texturePromises);
}
