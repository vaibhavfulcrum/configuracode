import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";
import { CfgOrbitalCamera } from "./CfgOrbitalCamera";
export type CameraCreator<C extends Camera> = (scene: Scene, canvas: HTMLElement) => C;

export function getDefaultCamera(scene: Scene, canvas: HTMLElement): CfgOrbitalCamera {
	return new CfgOrbitalCamera(scene, canvas);
}
