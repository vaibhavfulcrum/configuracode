import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { RenderEnv } from "../view/RenderEnv";
import { CfgGeometry } from "./CfgGeometry";

export class CfgMesh extends Mesh {
	constructor(
		name: string,
		renderEnvironment: RenderEnv,
		geometry: CfgGeometry,
		material: PBRMaterial
	) {
		super(name, renderEnvironment.scene);
		geometry.applyToMesh(this);
		this.material = material;
	}
}
