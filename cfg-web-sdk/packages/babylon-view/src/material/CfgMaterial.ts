import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color } from "@configura/web-core/dist/cm/basic/Color";
import {
	Bump3D,
	Diffuse3D,
	GMaterial3D,
	GMaterialProp3D,
	Transparency3D,
} from "@configura/web-core/dist/cm/core3D/GMaterial3D";
import { LogObservable, LogProducer } from "@configura/web-utilities";
import { hsl2rgb, rgb2hsl, toColor3 } from "../utilities/utilitiesColor";
import { RenderEnv } from "../view/RenderEnv";
import { MaterialMetaData } from "./material";
import { GMAndTexture } from "./texture";

function findTexture(textures: GMAndTexture[], t: typeof GMaterialProp3D): Texture | undefined {
	const gmv = textures.find((gmv) => gmv.gm instanceof t);
	if (gmv === undefined) {
		return undefined;
	}
	return gmv.tx;
}

// Constants (power of two) used to create the index for the variant
const DBL = 1;
const BTF = 2;
const FLP = 4;

/// A wrapper around Babylon.js PBRMaterial class.
///
/// Also contains logic to create light weight "variants" of the main PBRMaterial to take into
/// account that CmSym allows the meshes to have properties that affects the material currently
/// applied to the mesh, such as double doubled sided or flipping the textures along the y-axis.
///
/// The variants are created on demand if the request to getPBRMaterial specifies properties that
/// does not match the main PBRMaterial. The variants are then cached.
export class CfgMaterial implements LogProducer {
	private _material: PBRMaterial;
	private _variants: PBRMaterial[];

	public isTransparent = false;
	logger = new LogObservable();
	isProbablyChromeMaterial: boolean = false;

	public constructor(material: PBRMaterial, maxSimultaneousLights: number) {
		// Side orientation needs to be set, or the materials will be inside-out
		material.sideOrientation = PBRMaterial.CounterClockWiseSideOrientation;
		material.maxSimultaneousLights = maxSimultaneousLights;
		material.allowShaderHotSwapping = true;

		// Depending on which environment map is used, you might want to disable the radiance over
		// alpha setting since a very strong light can cause too much of the effect in for example
		// glass surfaces causing glitch-like effects. You can read more about it here:
		// https://doc.babylonjs.com/how_to/physically_based_rendering_master
		material.useRadianceOverAlpha = false;

		this._material = material;
		this._variants = new Array<PBRMaterial>(8);
		this._variants[this.indexFromMaterial(material)] = material;
	}

	/// This material is supposed to be rendered as double sided by default
	public isDoubleSided() {
		return !this._material.backFaceCulling;
	}

	public static fromTexture(
		renderEnvironment: RenderEnv,
		texture: Texture,
		sourcePath: string[]
	): CfgMaterial {
		sourcePath.push("fromTexture");

		let name = "(Img)";

		const fileName = texture.name?.split("\\").pop()?.split("/").pop();
		if (fileName) {
			name += " " + fileName;
		}

		const material = new PBRMaterial(name, renderEnvironment.scene);
		material.albedoTexture = texture;
		material.roughness = 1;
		material.metallic = 0;

		// TODO Babylon: What happens if the texture has an alpha map? Compare to Three.js and CET

		return new CfgMaterial(material, renderEnvironment.lightRig.lightCount);
	}

	public static compileFromGm(
		renderEnvironment: RenderEnv,
		meta: MaterialMetaData,
		gMaterial: GMaterial3D,
		textures: GMAndTexture[]
	): CfgMaterial {
		meta.sourcePath.push("compileFromGm");

		const {
			doubleSided,
			redCustomProperties: redEngineCustomProperties,
			reflection,
			bump,
			diffuse,
			specular,
			transparency,
		} = gMaterial;

		const bumpTexture = findTexture(textures, Bump3D);
		const diffuseTexture = findTexture(textures, Diffuse3D);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const specularTexture = findTexture(textures, Specular3D);
		const transparencyTexture = findTexture(textures, Transparency3D);

		let name = "";
		// See if the material has a given name
		if (gMaterial.misc !== undefined) {
			const miscName = gMaterial.misc.get("name");
			if (miscName && typeof miscName == "string" && miscName.length > 0) {
				name = " " + miscName;
			}
		}
		// If not, fall back to material key
		let key = gMaterial.materialKey;
		if (name.length === 0 && key !== undefined) {
			name = " " + key;
		}
		name = "(GM)" + name;

		const material = new PBRMaterial(name, renderEnvironment.scene);

		// Specular AA can help a lot with for example edges of very shiny materials, like the
		// base of our demo chair when the base overlaps / is overlapped by other geometry.
		//
		// TODO Babylon: Check what kind of performance penalty this results in. If noticeable,
		// consider only enabling it for shiny materials?
		//
		material.enableSpecularAntiAliasing = true;

		if (bump !== undefined && bumpTexture !== undefined) {
			material.bumpTexture = bumpTexture;
			// Bump the bump strength slightly to visually better match the render results in CET.
			bumpTexture.level = 1.2;
		}

		if (diffuse !== undefined) {
			if (diffuseTexture !== undefined) {
				diffuseTexture.hasAlpha = false;
				material.albedoTexture = diffuseTexture;
			} else {
				// From CmSym spec: "If an image url is specified it overrides the color."
				material.albedoColor = toColor3(diffuse.c || Color.BLACK).toLinearSpace();
			}
		}

		let isTransparent = false;
		if (transparency !== undefined) {
			if (transparency.opacity) {
				if (transparency.opacity < 1) {
					material.alpha = transparency.opacity;
					isTransparent = true;
				}
			}

			if (transparencyTexture) {
				material.opacityTexture = transparencyTexture;
				isTransparent = true;
			}
		}

		if (isTransparent) {
			// This is a tradeoff. Most 3D engines will by default render with depth write off for
			// alpha blended materials, but keep it on for alpha tested materials. We don't have
			// such a distinction, yet.
			//
			// For products like the forklift, it is much better with no depth write.
			// On the flip side, without it, the plants and other similar meshes look like crap.
			material.forceDepthWrite = true;

			// Default to alpha blend + alpha test
			material.transparencyMode = 3;

			// TODO: There is an alpha test variable in the CmSym format, use that if present.
			// Perhaps that can control if we use alpha blend or alpha test above. If it is reliable
			// enough... Update: Looks like that value is not exposed in the Material Lab, and thus
			// can't be used on its own.
			material.alphaCutOff = 0.05;

			// Transparent materials usually needs "back then front" rendering.
			material.separateCullingPass = true;
		}

		makeMaterialDoubleSided(material, doubleSided);

		/*
		 * In Babylon.js (and previous Three.js) we use PBR (physically based rendering) and
		 * use the metalness-roughness way to describe the reflective properties of the materials.
		 * Here is good overview: https://threejs.org/examples/?q=var#webgl_materials_variations_standard
		 *
		 * Specular amount => reduced specular => reduce metalness
		 * Specular area / exponent => reduced exponent => reduce roughness
		 * Specular exponent => 0.01 = 10000 and 1 = 0 see gmEditor.cm for more details.
		 *
		 * Reflection amount => reduced amount => reduced metalness
		 * Reflection sharpness => reduced sharpness => increase roughness
		 * In cmsym sharpness is saved as a customProperty with the name reflectionGlossiness
		 *
		 * In our conversion we weigh specular and reflection from cmsym together
		 * if they are both defined, otherwise we convert them by them self.
		 */
		let specularContribution;
		if (specular !== undefined && specular.exponent !== undefined) {
			const spec = toColor3(specular.c);
			const [, , specularColorLightness] = rgb2hsl(spec.r, spec.g, spec.b);
			specularContribution =
				Math.sqrt(1 / (specular.exponent + 1)) +
				1 -
				specular.amount * specularColorLightness;
		}

		let reflectionSharpness;
		if (redEngineCustomProperties !== undefined) {
			const reflectionGlossiness = redEngineCustomProperties.get("reflectionGlossiness");
			if (reflectionGlossiness && typeof reflectionGlossiness === "number") {
				reflectionSharpness = 1 - reflectionGlossiness;
			}
		}

		if (specularContribution !== undefined) {
			if (reflectionSharpness !== undefined) {
				material.roughness = (reflectionSharpness + specularContribution) / 2;
			} else {
				material.roughness = specularContribution;
			}
		} else {
			material.roughness = 0.9; // We default to non-reflective material to better match CET
		}

		let probablyChrome = false;
		material.metallic = 0.1; // We default to non-reflective material to better match CET
		if (reflection !== undefined && reflection.amount !== undefined) {
			const reflectionAmount = reflection.amount;
			material.metallic = reflectionAmount;
			// Since the Red Engine in CET needs the sum of reflectiveness and color to be max 1
			// very reflective materials will have a color close to black. Babylon.js needs very
			// reflective materials to have a very light color. See WRD-119 in Jira.
			if (diffuseTexture === undefined && material.roughness < reflectionAmount - 0.3) {
				// PBR material albedo color is in linear color space. The conversion to gamma
				// (normal, sRGB) color space is done to work exactly the same as the previous
				// Three.js version of the code. That said, if "reflectionAmount" is in a
				// linear space, then perhaps it is more correct without it...
				const color = material.albedoColor.toGammaSpace();
				const [h, s, l] = rgb2hsl(color.r, color.g, color.b);
				if (l < reflectionAmount) {
					probablyChrome = true;
					material.albedoColor = Color3.FromArray(
						hsl2rgb(h, s, reflectionAmount)
					).toLinearSpace();
				}
			}
		}

		for (const key of Object.keys(material)) {
			if ((material as any)[key] === undefined) {
				delete (material as any)[key];
			}
		}

		const cfgMaterial = new CfgMaterial(material, renderEnvironment.lightRig.lightCount);
		cfgMaterial.isProbablyChromeMaterial = probablyChrome;
		cfgMaterial.isTransparent = isTransparent;
		return cfgMaterial;
	}

	private indexFromOptions(doubleSided: boolean, backThenFront: boolean, flipTextures: boolean) {
		return (doubleSided ? DBL : 0) + (backThenFront ? BTF : 0) + (flipTextures ? FLP : 0);
	}

	private indexFromMaterial(material: PBRMaterial) {
		// Materials are never flipped by default, so the flipTextures (FLP) flag is always zero
		return (material.backFaceCulling ? 0 : DBL) + (material.separateCullingPass ? BTF : 0);
	}

	private cloneSuffix(doubleSided: boolean, backThenFront: boolean, flipTextures: boolean) {
		return ` (clone${doubleSided ? ",dbl" : ""}${backThenFront ? ",btf" : ""}${
			flipTextures ? ",flp" : ""
		});`;
	}

	/**
	 * Returns the PBRMaterial associated with this CfgMaterial, optionally modified.
	 *
	 * If none of the optional parameters are set, the returned material is the one initially
	 * supplied when the CfgMaterial was created.
	 *
	 * If any of the optional parameters are supplied, you will get back a material that has those
	 * options set to the given values. The returned material will be a clone if needed, the
	 * initial material is NOT affected by this.
	 *
	 * It is safe to call this method multiple times, this class keeps an internal material cache.
	 *
	 * @warning: Do not modify the returned material in any way since it might be shared with
	 * other parts of the model!
	 *
	 * @param doubleSided Makes sure that backFaceCulling is OFF in the returned material.
	 * @param backThenFront Makes sure that separateCullingPass is ON in the returned material.
	 * @param flipTextures Flips the textures in the material along the Y-axis.
	 */
	public getPBRMaterial(
		doubleSided?: boolean,
		backThenFront?: boolean,
		flipTextures?: boolean
	): PBRMaterial {
		if (doubleSided === undefined) {
			doubleSided = !this._material.backFaceCulling;
		}
		if (backThenFront === undefined) {
			backThenFront = this._material.separateCullingPass;
		}
		if (flipTextures === undefined) {
			// Materials are never flipped by default.
			flipTextures = false;
		}

		const index = this.indexFromOptions(doubleSided, backThenFront, flipTextures);
		if (this._variants[index] !== undefined) {
			return this._variants[index];
		}

		const clone = this._material.clone(
			this._material.name + this.cloneSuffix(doubleSided, backThenFront, flipTextures)
		);
		clone.separateCullingPass = backThenFront;
		makeMaterialDoubleSided(clone, doubleSided);
		if (flipTextures) {
			flipMaterialTextures(clone);
		}
		this._variants[index] = clone;
		return clone;
	}
}

/// The exact changes this method makes depends on the material's separateCullingPass setting, so
/// make sure make any changes to that property before calling this method.
export function makeMaterialDoubleSided(material: PBRMaterial, doubleSided: boolean) {
	if (doubleSided) {
		// SeparateCullingPass breaks twoSidedLightning by not flipping the normals when
		// rendering the back faces of the triangles. forceNormalForward works around that
		// but is a bit slower due to more complex shader calculations so only use when needed.
		material.backFaceCulling = false;
		material.twoSidedLighting = !material.separateCullingPass;
		material.forceNormalForward = material.separateCullingPass;
	} else {
		material.backFaceCulling = true; // Don't render backside of triangles
		material.twoSidedLighting = false; // Don't flip normals on back face of triangles
		material.forceNormalForward = false; // Don't change the normals to front facing
	}
}

/// Clones all the textures used in the material and flips them along the y-axis by inverting the
/// texture's vScale, vOffset and wRotation.
///
/// @note: The flipped state is not stored in the material it self, so calling this method twice on
/// the same material will undo the flip.
function flipMaterialTextures(material: PBRMaterial) {
	material.albedoTexture = cloneAndFlipTexture(material.albedoTexture);
	material.bumpTexture = cloneAndFlipTexture(material.bumpTexture);
	material.ambientTexture = cloneAndFlipTexture(material.ambientTexture);
	material.opacityTexture = cloneAndFlipTexture(material.opacityTexture);
	material.emissiveTexture = cloneAndFlipTexture(material.emissiveTexture);
	material.metallicTexture = cloneAndFlipTexture(material.metallicTexture);
	material.lightmapTexture = cloneAndFlipTexture(material.lightmapTexture);
	material.refractionTexture = cloneAndFlipTexture(material.reflectivityTexture);
	material.reflectivityTexture = cloneAndFlipTexture(material.reflectivityTexture);
	material.microSurfaceTexture = cloneAndFlipTexture(material.microSurfaceTexture);
}

/// Returns undefined if texture is undefined.
/// Returns original texture if it isn't of type "Texture".
/// Otherwise, Clones and flips the texture along the y-axis by inverting vScale, vOffset and wAng.
function cloneAndFlipTexture(texture: Texture | BaseTexture) {
	if (texture instanceof Texture) {
		texture = texture.clone();
		if (texture instanceof Texture) {
			texture.vScale *= -1; // Flips along y-axis
			texture.vOffset *= -1; // Adjust texture offset due to flip
			texture.wAng *= -1; // Adjust rotation direction due to the flip
		}
	}
	return texture;
}
