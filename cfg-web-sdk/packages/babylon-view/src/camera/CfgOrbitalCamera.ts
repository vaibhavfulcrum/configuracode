import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { ArcRotateCameraKeyboardMoveInput } from "@babylonjs/core/Cameras/Inputs/arcRotateCameraKeyboardMoveInput";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { degToRad, Observable } from "@configura/web-utilities";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import {
	boundingBoxesAreSignificantlyDifferent,
	measureLongestDistanceToCorner,
} from "../utilities/utilities3D";
import { CfgArcRotateCameraPointersInput } from "./CfgArcRotateCameraPointersInput";
import {
	CfgOrbitalCameraControlProps,
	orbitalCameraControlPropsEquals,
} from "./CfgOrbitalCameraControlProps";

const NEAREST_ALLOWED_TO_BETA_LIMITS = 0.1;
export const MAX_UPPER_BETA_LIMIT = Math.PI - NEAREST_ALLOWED_TO_BETA_LIMITS;
export const MIN_LOWER_BETA_LIMIT = NEAREST_ALLOWED_TO_BETA_LIMITS;

/**
 * @param fov Field of view, in radians. Default value degToRad(30).
 * @param mouseWheelSpeedFactor The higher the slower movement. Default value 200.
 * @param pinchZoomFactor The higher the slower zoom (really dolly). Default value 100.
 * @param keyboardSpeedFactor The higher the faster movement. Default value 0.002.
 * @param pointerSpeedFactor The higher the slower movement. Default value 2000.
 * @param inertia How fast does speed decline. Must be less than 1. Default value 0.93.
 * @param keepCameraFromGettingTooCloseFactor How much further than closest corner is near limit. 1.5 means 50% further. Default value 1.5.
 * @param significantBoundingBoxSizeChangeFactor How much change in size will make the the zoom reset. 0.3 means 30% size change on one axel. Default value 0.3.
 */
export type CfgOrbitalCameraConfig = {
	fov: number;
	mouseWheelSpeedFactor: number;
	pinchZoomFactor: number;
	keyboardSpeedFactor: number;
	pointerSpeedFactor: number;
	inertia: number;
	keepCameraFromGettingTooCloseFactor: number;
	significantBoundingBoxSizeChangeFactor: number;
};

const defaultOrbitalCameraConfig: CfgOrbitalCameraConfig = {
	fov: degToRad(30),
	mouseWheelSpeedFactor: 200,
	pinchZoomFactor: 100,
	inertia: 0.93,
	keyboardSpeedFactor: 0.002,
	pointerSpeedFactor: 2000,
	keepCameraFromGettingTooCloseFactor: 1.5,
	significantBoundingBoxSizeChangeFactor: 0.3,
};

export class CfgOrbitalCamera extends ArcRotateCamera {
	constructor(
		scene: Scene,
		private _canvas: HTMLElement,
		config?: Partial<CfgOrbitalCameraConfig>
	) {
		super("CfgOrbitalCamera", 0, degToRad(90), 50, new Vector3(0, 0, 0), scene);

		this.attachControl(
			_canvas, // This parameters is not actually used for anything. But still required.
			false, // No panning with keyboard
			false, // No panning with mouse
			undefined
		);

		// Workaround for touch issues on iOS, see comments in CfgArcRotateCameraPointersInput.ts
		this.inputs.removeByType("ArcRotateCameraPointersInput");
		this.inputs.add(new CfgArcRotateCameraPointersInput());

		// Make sure to disable all forms of "panning", which for the ArcRotateCamera is defined
		// as movement sideways without rotation to keep the camera centered on the target.
		// The settings above for attachControl will not disable two-finger touch.
		this.panningAxis = Vector3.Zero();
		this.panningDistanceLimit = 0;
		this.panningSensibility = 0;
		this.panningInertia = 0;

		this._config = { ...defaultOrbitalCameraConfig, ...config };
		const keyboardInput = this.inputs.attached["keyboard"] as ArcRotateCameraKeyboardMoveInput;
		keyboardInput.angularSpeed = this._config.keyboardSpeedFactor;

		this.fov = this._config.fov;
		this.inertia = this._config.inertia;
		this.angularSensibilityX = this.angularSensibilityY = this._config.pointerSpeedFactor;

		this.onViewMatrixChangedObservable.add(this._boundNotifyCameraControlListeners);
	}

	dispose() {
		this.detachControl(this._canvas);
		this.onViewMatrixChangedObservable.removeCallback(this._boundNotifyCameraControlListeners);
		super.dispose();
	}

	protected _config: CfgOrbitalCameraConfig;

	private _currentBoundingBox = new CfgBoundingBox();
	private _currentMinDistanceToKeepCameraOutOfModel: number | undefined;
	private _currentMinDistanceToFitModelInView: number | undefined;

	private _orbitalCameraControlObservable: Observable<CfgOrbitalCameraControlProps> | undefined;
	private _previousOrbitalCameraControlProps: CfgOrbitalCameraControlProps | undefined;

	public disableSubFloorCam: boolean = false;
	public disableAutomaticSizing: boolean = false;

	public disableZoom: boolean = false;

	private _externalControlHasHappened: boolean = false;

	forceRadius(r: number) {
		this._radius = r;
	}

	private _radius: number = 0;

	set radius(r: number) {
		if (this.disableZoom) {
			return;
		}
		this._radius = r;
	}

	get radius(): number {
		return this._radius;
	}

	private get _orbitalCameraControlProps(): CfgOrbitalCameraControlProps {
		return {
			distance: this.radius,
			yaw: this.alpha,
			pitch: this.beta,
		};
	}

	private _boundNotifyCameraControlListeners = () => {
		this._notifyCameraControlListeners();
	};

	public frameRenderNeeded(): boolean {
		const externalControlHasHappened = this._externalControlHasHappened;
		if (externalControlHasHappened) {
			this._externalControlHasHappened = false;
		}

		return (
			this.useAutoRotationBehavior ||
			externalControlHasHappened ||
			this.inertialAlphaOffset !== 0 ||
			this.inertialBetaOffset !== 0 ||
			this.inertialPanningX !== 0 ||
			this.inertialPanningY !== 0 ||
			this.inertialRadiusOffset !== 0
		);
	}

	private _notifyCameraControlListeners() {
		if (this._orbitalCameraControlObservable === undefined) {
			return;
		}

		const orbitalCameraControlProps = this._orbitalCameraControlProps;

		if (
			this._previousOrbitalCameraControlProps !== undefined &&
			orbitalCameraControlPropsEquals(
				this._previousOrbitalCameraControlProps,
				orbitalCameraControlProps
			)
		) {
			return;
		}

		this._orbitalCameraControlObservable.notifyAll(
			orbitalCameraControlProps,
			this._orbitalCameraControlObservable
		);
		this._previousOrbitalCameraControlProps = orbitalCameraControlProps;
	}

	public get cameraControlObservable() {
		if (this._orbitalCameraControlObservable === undefined) {
			this._orbitalCameraControlObservable = new Observable<CfgOrbitalCameraControlProps>();
			this._orbitalCameraControlObservable.listen((c) => {
				const { distance, yaw, pitch } = c;

				let change = false;
				if (distance !== undefined && distance !== this.radius) {
					this.forceRadius(distance);
					change = true;
				}
				if (yaw !== undefined && yaw !== this.alpha) {
					this.alpha = yaw;
					change = true;
				}
				if (pitch !== undefined && pitch !== this.beta) {
					this.beta = pitch;
					change = true;
				}
				if (change) {
					this._externalControlHasHappened = true;
					this._notifyCameraControlListeners();
				}
			}, this._orbitalCameraControlObservable);
		}
		return this._orbitalCameraControlObservable;
	}

	setContentBoundingBox(newBoundingBox: CfgBoundingBox, force: boolean) {
		const previousBoundingBox = this._currentBoundingBox.clone();

		this._currentBoundingBox = newBoundingBox;

		const significantChange = boundingBoxesAreSignificantlyDifferent(
			previousBoundingBox,
			newBoundingBox,
			this._config.significantBoundingBoxSizeChangeFactor
		);

		if (!significantChange && !force) {
			return;
		}

		this._applyAdaptToContentBoundingBox(force);
		this._applyNoSneakPeeking();
	}

	_applyAdaptToContentBoundingBox(force: boolean) {
		const bb = this._currentBoundingBox;

		if (bb.isEmpty) {
			return;
		}

		// Keeps the camera from recomputing angles
		const pre: [number, number] = [this.alpha, this.beta];

		this.target = bb.center;

		if (this.disableAutomaticSizing) {
			return;
		}

		[this.alpha, this.beta] = pre;

		this._updateCameraLimits();

		const minDistanceToFitModelInView = this._currentMinDistanceToFitModelInView;
		const minDistanceToKeepCameraOutOfModel = this._currentMinDistanceToKeepCameraOutOfModel;

		if (minDistanceToFitModelInView !== undefined) {
			if (force || this.radius < minDistanceToFitModelInView) {
				this.forceRadius(minDistanceToFitModelInView);
			}
		}

		if (
			minDistanceToKeepCameraOutOfModel !== undefined &&
			minDistanceToFitModelInView !== undefined
		) {
			this.lowerRadiusLimit =
				minDistanceToKeepCameraOutOfModel *
				this._config.keepCameraFromGettingTooCloseFactor;
			this.upperRadiusLimit = minDistanceToFitModelInView * 2;

			this.wheelPrecision =
				this._config.mouseWheelSpeedFactor / minDistanceToKeepCameraOutOfModel;

			this.pinchPrecision = this._config.pinchZoomFactor / minDistanceToKeepCameraOutOfModel;

			this.speed = minDistanceToKeepCameraOutOfModel * 0.1;
		}
	}

	refreshCameraNearFar() {
		const minDistanceToKeepCameraOutOfModel = this._currentMinDistanceToKeepCameraOutOfModel;

		if (minDistanceToKeepCameraOutOfModel === undefined) {
			return;
		}

		const cameraDistance = this.radius;

		const extraSpaceFactor = 1.5; // Because when zooming fast it seems the limits do not keep up

		const graceDistance = minDistanceToKeepCameraOutOfModel * extraSpaceFactor;

		this.minZ = cameraDistance - graceDistance;
		this.maxZ = cameraDistance + graceDistance;
	}

	private _applyNoSneakPeeking() {
		if (!this.disableSubFloorCam) {
			this.upperBetaLimit = MAX_UPPER_BETA_LIMIT;
			return;
		}

		//It might be impolite to look at a Cfg models underside
		const noPeekLimit = this._calculateNoPeekingLimit();

		if (noPeekLimit === undefined || !isFinite(noPeekLimit)) {
			this.upperBetaLimit = MAX_UPPER_BETA_LIMIT;
			return;
		}

		this.upperBetaLimit = Math.min(MAX_UPPER_BETA_LIMIT, Math.PI / 2 - noPeekLimit);
	}

	private _updateCameraLimits() {
		const bb = this._currentBoundingBox;

		const fovVertical = this.fov;
		const aspect = this.getEngine().getScreenAspectRatio();

		const bbAdjustedForCameraPosition = bb.clone().translate(this.target.negate());

		const longestDistanceToCornerInXYZSpace = measureLongestDistanceToCorner(
			bbAdjustedForCameraPosition,
			[0, 1, 2]
		);
		const longestDistanceToCornerInXZPlane = measureLongestDistanceToCorner(
			bbAdjustedForCameraPosition,
			[0, 2]
		);

		const fovHorizontalRad = 2 * Math.atan(Math.tan(fovVertical / 2) * aspect);

		const maxAllowedHeight = longestDistanceToCornerInXYZSpace * 2;
		const maxAllowedWidth = longestDistanceToCornerInXZPlane * 2; //Because the model can not be tilted, only spun

		const minDistanceToFitInViewFromWidth =
			maxAllowedWidth / (2 * Math.tan(fovHorizontalRad / 2));
		const minDistanceToFitInViewFromHeight = maxAllowedHeight / (2 * Math.tan(fovVertical / 2));

		const minDistanceToFitModelInView = Math.max(
			minDistanceToFitInViewFromWidth,
			minDistanceToFitInViewFromHeight
		);

		this._currentMinDistanceToKeepCameraOutOfModel = isFinite(longestDistanceToCornerInXYZSpace)
			? longestDistanceToCornerInXYZSpace
			: undefined;

		this._currentMinDistanceToFitModelInView = isFinite(minDistanceToFitModelInView)
			? minDistanceToFitModelInView
			: undefined;
	}

	private _calculateNoPeekingLimit() {
		const bb = this._currentBoundingBox;

		if (bb.isEmpty) {
			return undefined;
		}

		const bottomDepth = bb.minimum.y - this.target.y;
		const cameraDistance = this.radius;
		const lowestAngleUnderHorizonRad = Math.asin(bottomDepth / cameraDistance);

		return lowestAngleUnderHorizonRad;
	}
}
