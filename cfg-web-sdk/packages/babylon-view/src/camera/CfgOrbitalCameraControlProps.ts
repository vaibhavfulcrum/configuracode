export interface CfgOrbitalCameraControlProps {
	distance?: number;
	yaw?: number;
	pitch?: number;
}

export function orbitalCameraControlPropsEquals(
	left: CfgOrbitalCameraControlProps,
	right: CfgOrbitalCameraControlProps
) {
	return left.distance === right.distance && left.yaw === right.yaw && left.pitch === right.pitch;
}
