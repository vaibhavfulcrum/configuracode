import { EventListener } from "@configura/web-utilities";
import { CameraConfigurationProps, cameraConfigurationPropsEquals } from "./BaseViewConfiguration";
import {
	SingleProductViewConfiguration,
	SingleProductViewEventMap,
} from "./SingleProductViewConfiguration";

/**
 * @param disableZoom Don't let the camera dolly in and out. Zoom is stricly speaking not correct, we only dolly the camera.
 * @param disableAutomaticSizing Turn off automatic adaption of camera distance and light rig size.
 * @param disableSubFloorCam It is common that catalogue models are designed to never be shown from below. This limits camera polar angle.
 * @param distance Only works if disableAutomaticSizing is set
 * @param yaw Horisontal angle for the camera. Range -π/2 to π/2 radians.
 * @param pitch Vertical angle for the camera. Range 0 to π/2 radians, measured from the north pole.
 * @param autoRotate See babylon-documentation for parameter-documentation
 */

export type SingleProductDefaultCameraDirection = {
	distance?: number;
	yaw?: number;
	pitch?: number;
};

export interface SingleProductDefaultCameraViewConfiguration
	extends SingleProductViewConfiguration {
	camera?: SingleProductDefaultCameraDirection & {
		disableZoom?: boolean;
		disableAutomaticSizing?: boolean;
		disableSubFloorCam?: boolean;
		autoRotate?: {
			idleRotationSpeed?: number;
			idleRotationSpinupTime?: number;
			idleRotationWaitTime?: number;
			zoomStopsAnimation?: boolean;
		};
	};
}

export interface SingleProductDefaultCameraViewEventMap extends SingleProductViewEventMap {
	orbitalCameraConfiguration: OrbitalCameraConfigurationProps;
}

export type SingleProductDefaultCameraViewEventListener<
	K extends keyof SingleProductDefaultCameraViewEventMap
> = EventListener<SingleProductDefaultCameraViewEventMap, K>;

export interface OrbitalCameraConfigurationProps extends CameraConfigurationProps {
	disableZoom: boolean;
	minDistance: number;
	maxDistance: number;
	minYaw: number;
	maxYaw: number;
	minPitch: number;
	maxPitch: number;
}

export function orbitalCameraConfigurationPropsEquals(
	left: OrbitalCameraConfigurationProps,
	right: OrbitalCameraConfigurationProps
): boolean {
	return (
		left.disableZoom === right.disableZoom &&
		left.minDistance === right.minDistance &&
		left.maxDistance === right.maxDistance &&
		left.minYaw === right.minYaw &&
		left.maxYaw === right.maxYaw &&
		left.minPitch === right.minPitch &&
		left.maxPitch === right.maxPitch &&
		cameraConfigurationPropsEquals(left, right)
	);
}
