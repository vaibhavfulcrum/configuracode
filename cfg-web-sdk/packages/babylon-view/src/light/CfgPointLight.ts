import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { toColor3 } from "../utilities/utilitiesColor";

export class CfgPointLight extends PointLight {
	constructor(
		name: string,
		scene: Scene,
		parent?: Node,
		position?: Vector3,
		color?: Color3 | string | number,
		intensity?: number
	) {
		if (position === undefined) {
			position = Vector3.Zero();
		}
		super(name, position, scene);

		if (parent) {
			this.parent = parent;
		}

		this.specular = this.diffuse = toColor3(color);

		if (intensity !== undefined) {
			this.intensity = intensity;
		}
	}
}
