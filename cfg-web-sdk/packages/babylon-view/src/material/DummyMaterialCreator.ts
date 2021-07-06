import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Scene } from "@babylonjs/core/scene";
import { toColor3 } from "../utilities/utilitiesColor";
import { CfgMaterial, makeMaterialDoubleSided } from "./CfgMaterial";

export type DummyMaterialCreator = (
	scene: Scene,
	maxSimultaneousLights: number,
	color?: number
) => CfgMaterial;

export function defaultDummyMaterialCreator(
	scene: Scene,
	maxSimultaneousLights: number,
	color?: number
) {
	const material = new PBRMaterial("Dummy Material", scene);
	material.albedoColor = toColor3(color === undefined ? 0xb5b5b5 : color).toLinearSpace();
	material.roughness = 1;

	// For a rather nice x-ray version during loading, enable the settings below
	// material.alpha = 0.2;
	// material.transparencyMode = 2;
	// material.disableDepthWrite = true;
	// material.separateCullingPass = true;

	makeMaterialDoubleSided(material, true); // Double sided improved mesh compatibility

	return new CfgMaterial(material, maxSimultaneousLights);
}
