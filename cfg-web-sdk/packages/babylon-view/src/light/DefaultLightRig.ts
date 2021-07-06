import { Light } from "@babylonjs/core/Lights/light";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { CfgDirectionalLight } from "./CfgDirectionalLight";
import { CfgPointLight } from "./CfgPointLight";
import { LightRig, LightRigCreator } from "./LightRigCreator";

const LIGHT_DECAY = 2;

const BASE_LIGHT_SCALE = 1;
const BASE_LIGHT_POWER = 7;
const BASE_NO_DECAY_LIGHT_POWER = BASE_LIGHT_POWER * 0.5;
const BASE_DECAY_LIGHT_POWER = BASE_LIGHT_POWER * 30 * Math.pow(BASE_LIGHT_SCALE, LIGHT_DECAY);

function isDecayingLight(object: unknown) {
	return object instanceof CfgPointLight;
}

export const getDefaultLightRigCreator = (relativeToCamera: boolean): LightRigCreator => (
	scene: Scene,
	target: Node | undefined
): LightRig => new DefaultLightRig(scene, relativeToCamera ? target : undefined);

export class DefaultLightRig extends LightRig {
	private _allLights: Light[] = [];
	private _allPointLights: CfgPointLight[] = [];

	private _defaultIntensities: number[] = [];

	private _dimLevel: number = 1;
	public get dimLevel() {
		return this._dimLevel;
	}

	public set dimLevel(v: number) {
		this._dimLevel = v;
		this.applyDimLevel();
	}

	private _scale: number = 1;
	public get scale() {
		return this._scale;
	}

	public set scale(v: number) {
		this._scale = v;
		this.applyDimLevel();
		this.applyScale();
	}

	private applyDimLevel() {
		const decayCompensation = Math.pow(this.scale, LIGHT_DECAY);
		this._allPointLights.forEach((light, index) => {
			light.intensity =
				this._defaultIntensities[index] *
				this.dimLevel *
				(isDecayingLight(light) ? decayCompensation : 1);
		});
	}

	private applyScale() {
		this.scaling = new Vector3(this.scale, this.scale, this.scale);
	}

	constructor(scene: Scene, target: Node | undefined) {
		super("Light Rig");

		if (target === undefined) {
			scene.addTransformNode(this);
		} else {
			this.setParent(target);
		}

		this.position.setAll(0);
		this.scaling.setAll(1);
		this.rotation.setAll(0);

		const lightColor = 0xffffff;

		// The light rig is by default attached to a CfgOrbitalCamera and thus rotates around the
		// current product, as well being scaled to fit around the product. The names of the lights
		// below are relative to what the camera looks at in this default configuration. In other
		// words, "behind" means the light is on the far side of the product relative to the camera.
		this._allLights.push(
			new CfgDirectionalLight(
				"directional",
				scene,
				this,
				new Vector3(-35, -25, -10),
				lightColor,
				1.2 * BASE_NO_DECAY_LIGHT_POWER
			)
		);
		this._allPointLights.push(
			new CfgPointLight(
				"rightUpBehind",
				scene,
				this,
				new Vector3(10, 10, -5).scaleInPlace(BASE_LIGHT_SCALE),
				lightColor,
				0.8 * BASE_DECAY_LIGHT_POWER
			)
		);
		this._allPointLights.push(
			new CfgPointLight(
				"below",
				scene,
				this,
				new Vector3(0, -10, 0).scaleInPlace(BASE_LIGHT_SCALE),
				lightColor,
				1.5 * BASE_DECAY_LIGHT_POWER
			)
		);
		this._allPointLights.push(
			new CfgPointLight(
				"leftFront",
				scene,
				this,
				new Vector3(-10, 0, 10).scaleInPlace(BASE_LIGHT_SCALE),
				lightColor,
				1.2 * BASE_DECAY_LIGHT_POWER
			)
		);
		this._allPointLights.push(
			new CfgPointLight(
				"rightUpFront",
				scene,
				this,
				new Vector3(10, 10, 5).scaleInPlace(BASE_LIGHT_SCALE),
				lightColor,
				0.8 * BASE_DECAY_LIGHT_POWER
			)
		);
		this._allPointLights.push(
			new CfgPointLight(
				"rightUp",
				scene,
				this,
				new Vector3(1, 15, 0).scaleInPlace(BASE_LIGHT_SCALE),
				lightColor,
				0.8 * BASE_DECAY_LIGHT_POWER
			)
		);

		this._allLights.push(...this._allPointLights);

		this._allLights.forEach((light, index) => {
			this._defaultIntensities[index] = light.intensity;
		});
	}

	public get lightCount() {
		return this._allLights.length;
	}
}
