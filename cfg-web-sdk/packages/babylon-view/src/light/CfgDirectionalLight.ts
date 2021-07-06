import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { toColor3 } from "../utilities/utilitiesColor";

export class CfgDirectionalLight extends DirectionalLight {
	constructor(
		name: string,
		scene: Scene,
		parent?: Node,
		direction?: Vector3,
		color?: Color3 | string | number,
		intensity?: number
	) {
		if (direction === undefined) {
			direction = Vector3.Down();
		}

		super(name, direction, scene);

		if (parent) {
			this.parent = parent;
		}

		this.specular = this.diffuse = toColor3(color);

		if (intensity !== undefined) {
			this.intensity = intensity;
		}
	}
}
