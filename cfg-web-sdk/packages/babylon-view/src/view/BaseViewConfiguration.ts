import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DetailLevel } from "@configura/web-core/dist/cm/geometry/DetailMask";
import { EventListener } from "@configura/web-utilities";
import { vector3Equals } from "../utilities/utilities3D";
import { RenderEnv } from "./RenderEnv";

export { DetailLevel } from "@configura/web-core/dist/cm/geometry/DetailMask";

/**
 * @param allowedDetailLevels Optionally controls the detail level (LOD, level of detail) allowed
 * when loading the 3D models. Provide a single DetailLevel or an array of them if you want to
 * override the default selection and/or order. The order of the array defines the priority since
 * models are not guaranteed to have all DetailLevels available.
 */
export interface BaseViewConfiguration {
	allowedDetailLevels?: DetailLevel | DetailLevel[];
}

export type BaseViewEventListener<K extends keyof BaseViewEventMap> = EventListener<
	BaseViewEventMap,
	K
>;

export type ScheduleRerender = (dumpNextFrameToImage?: ImageDumpCallback) => void;

export type ImageDumpCallback = (imageDataUrl: string) => void;

export interface BaseViewEventMap {
	renderEnv: RenderEnv;
	error: Error;
	loading: boolean;
	cameraConfiguration: CameraConfigurationProps;
}

export interface CameraConfigurationProps {
	nearClipping: number;
	farClipping: number;
	position: Vector3;
	contentPosition: Vector3;
	fov: number;
	aspect: number;
}

export function cameraConfigurationPropsEquals(
	left: CameraConfigurationProps,
	right: CameraConfigurationProps
): boolean {
	return (
		left.nearClipping === right.nearClipping &&
		left.farClipping === right.farClipping &&
		vector3Equals(left.position, right.position) &&
		left.fov === right.fov
	);
}
