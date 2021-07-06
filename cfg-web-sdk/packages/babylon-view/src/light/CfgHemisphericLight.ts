import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { toColor3 } from "../utilities/utilitiesColor";

export class CfgHemisphericLight extends HemisphericLight {
	constructor(
		name: string,
		scene: Scene,
		parent?: Node,
		color?: Color3 | string | number,
		intensity?: number
	) {
		super(name, new Vector3(0, 0, 1), scene);

		if (parent) {
			this.parent = parent;
		}

		this.groundColor = Color3.Black();
		this.specular = this.diffuse = toColor3(color);

		if (intensity !== undefined) {
			this.intensity = intensity;
		}
	}
}
