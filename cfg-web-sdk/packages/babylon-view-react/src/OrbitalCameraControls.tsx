import {
	CfgOrbitalCameraControlProps,
	OrbitalCameraConfigurationProps,
} from "@configura/babylon-view";
import { Observable } from "@configura/web-utilities";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

enum SliderType {
	Yaw = "rotation",
	Pitch = "angle",
	Distance = "zoom",
}

type SliderProps = {
	sliderType: SliderType;
	value: number;
	min: number;
	max: number;
	onChange: (event: React.FormEvent<HTMLInputElement>) => void;
};

function Slider(props: SliderProps) {
	const { sliderType, value, min, max, onChange } = props;
	let iconLeft: string, iconRight: string;
	switch (sliderType) {
		case SliderType.Yaw:
			iconLeft = "<";
			iconRight = ">";
			break;
		case SliderType.Pitch:
			iconLeft = "v";
			iconRight = "^";
			break;
		case SliderType.Distance:
			iconLeft = "-";
			iconRight = "+";
			break;
		default:
			return <></>;
	}
	return (
		<div className="cfgOrbitalCameraControlSliderContainer">
			<div className="cfgOrbitalCameraControlsIcon">{iconLeft}</div>
			<input
				className="cfgSlider"
				type="range"
				name={sliderType}
				min={min}
				max={max}
				step="any"
				value={value}
				onChange={onChange}
			></input>
			<div className="cfgOrbitalCameraControlsIcon">{iconRight}</div>
		</div>
	);
}

interface Props {
	active?: Observable<boolean>;
	cameraControl: Observable<CfgOrbitalCameraControlProps>;
	orbitalCameraConfiguration?: OrbitalCameraConfigurationProps;
}

export function OrbitalCameraControls(props: Props) {
	const { cameraControl, active: activeObservable, orbitalCameraConfiguration } = props;

	const [minDistance, setMinDistance] = useState(0.1);
	const [maxDistance, setMaxDistance] = useState(10);
	const [minYaw, setMinYaw] = useState(-Math.PI);
	const [maxYaw, setMaxYaw] = useState(Math.PI);
	const [minPitch, setMinPitch] = useState(0);
	const [maxPitch, setMaxPitch] = useState(Math.PI);

	const [active, setActive] = useState(activeObservable === undefined);

	const [disableZoom, setDisableZoom] = useState(false);
	const [distance, setDistance] = useState(0);
	const [yaw, setYaw] = useState(0);
	const [pitch, setPitch] = useState(0);

	useEffect(() => {
		if (activeObservable === undefined) {
			return;
		}

		activeObservable.listen(setActive);

		return () => {
			activeObservable.stopListen(setActive);
		};
	}, [activeObservable]);

	useEffect(() => {
		const f = (p: CfgOrbitalCameraControlProps) => {
			const pDistance = p.distance;
			const pYaw = p.yaw;
			const pPitch = p.pitch;
			if (pDistance !== undefined) {
				setDistance(pDistance);
			}
			if (pYaw !== undefined) {
				setYaw(pYaw);
			}
			if (pPitch !== undefined) {
				setPitch(pPitch);
			}
		};

		cameraControl.listen(f);

		return () => {
			cameraControl.stopListen(f);
		};
	}, [cameraControl]);

	useEffect(() => {
		if (orbitalCameraConfiguration === undefined) {
			return;
		}

		function set(s: Dispatch<SetStateAction<number>>, v: number | undefined): void {
			if (v === undefined || !isFinite(v)) {
				return;
			}
			s(v);
		}

		setDisableZoom(orbitalCameraConfiguration.disableZoom);
		set(setMinDistance, orbitalCameraConfiguration.minDistance);
		set(setMaxDistance, orbitalCameraConfiguration.maxDistance);
		set(setMinYaw, orbitalCameraConfiguration.minYaw);
		set(setMaxYaw, orbitalCameraConfiguration.maxYaw);
		set(setMinPitch, orbitalCameraConfiguration.minPitch);
		set(setMaxPitch, orbitalCameraConfiguration.maxPitch);
	}, [orbitalCameraConfiguration]);

	if (!active) {
		return null;
	}

	return (
		<div>
			<h3 className="cfgOrbitalCameraControlsHeader">3D Controls</h3>

			{activeObservable && (
				<button onClick={(event) => activeObservable.notifyAll(false)}>X</button>
			)}

			<div className="cfgOrbitalCameraControlsLabel">YAW</div>
			<Slider
				sliderType={SliderType.Yaw}
				value={yaw}
				min={minYaw}
				max={maxYaw}
				onChange={(event) => {
					cameraControl.notifyAll({
						yaw: parseFloat(event.currentTarget.value),
					});
				}}
			/>

			<div className="cfgOrbitalCameraControlsLabel">PITCH</div>
			<Slider
				sliderType={SliderType.Pitch}
				value={pitch}
				min={minPitch}
				max={maxPitch}
				onChange={(event) => {
					cameraControl.notifyAll({
						pitch: parseFloat(event.currentTarget.value),
					});
				}}
			/>

			{disableZoom !== true && (
				<>
					<div className="cfgOrbitalCameraControlsLabel">ZOOM</div>
					<Slider
						sliderType={SliderType.Distance}
						value={minDistance + maxDistance - distance}
						min={minDistance}
						max={maxDistance}
						onChange={(event) => {
							cameraControl.notifyAll({
								distance:
									minDistance +
									maxDistance -
									parseFloat(event.currentTarget.value),
							});
						}}
					/>
				</>
			)}
		</div>
	);
}
