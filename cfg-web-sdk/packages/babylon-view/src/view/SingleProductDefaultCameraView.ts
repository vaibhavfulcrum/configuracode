import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { EventListener, Observable } from "@configura/web-utilities";
import { getDefaultCamera } from "../camera/CameraCreator";
import {
	CfgOrbitalCamera,
	MAX_UPPER_BETA_LIMIT,
	MIN_LOWER_BETA_LIMIT,
} from "../camera/CfgOrbitalCamera";
import { EngineCreator } from "../engine/EngineCreator";
import { LightRigCreator } from "../light/LightRigCreator";
import { DummyMaterialCreator } from "../material/DummyMaterialCreator";
import { SceneCreator } from "../scene/SceneCreator";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import { measureLongestDistanceToCorner } from "../utilities/utilities3D";
import {
	OrbitalCameraConfigurationProps,
	orbitalCameraConfigurationPropsEquals,
	SingleProductDefaultCameraDirection,
	SingleProductDefaultCameraViewConfiguration,
	SingleProductDefaultCameraViewEventMap,
} from "./SingleProductDefaultCameraViewConfiguration";
import { SingleProductView } from "./SingleProductView";

const CONTENT_TO_LIGHT_RIG_SCALE_FACTOR = 1;

export type SingleProductDefaultCameraViewConstructorOptions = {
	canvas: HTMLCanvasElement;
	engineCreator?: EngineCreator;
	lightRigCreator?: LightRigCreator;
	sceneCreator?: SceneCreator;
	dummyMaterialCreator?: DummyMaterialCreator;
};

export class SingleProductDefaultCameraView<
	T extends SingleProductDefaultCameraViewEventMap = SingleProductDefaultCameraViewEventMap
> extends SingleProductView<CfgOrbitalCamera, T> {
	private _orbitalCameraConfigurationObservable:
		| Observable<OrbitalCameraConfigurationProps>
		| undefined;

	private _previousOrbitalCameraConf: OrbitalCameraConfigurationProps | undefined;

	constructor(options: SingleProductDefaultCameraViewConstructorOptions) {
		super({ ...options, cameraCreator: getDefaultCamera });
	}

	private _cameraConf: SingleProductDefaultCameraDirection = {};

	public resetCamera() {
		this.handleSizing(true);

		const { distance, pitch, yaw } = this._cameraConf;

		let change = false;

		if (distance !== undefined) {
			this._camera.radius = distance;
			change = true;
		}

		if (pitch !== undefined) {
			this._camera.beta = pitch;
			change = true;
		}

		if (yaw !== undefined) {
			this._camera.alpha = yaw;
			change = true;
		}

		if (change) {
			// Force a recompute of the view matrix as if a target-change happens in
			// the same frame render alpha/beta will be reset.
			this._camera.getViewMatrix();
		}
	}

	public setConfiguration(configuration: SingleProductDefaultCameraViewConfiguration) {
		super.setConfiguration(configuration);

		const cameraConf = configuration.camera || {};

		this._camera.disableAutomaticSizing = cameraConf.disableAutomaticSizing === true;
		this._camera.disableZoom = cameraConf.disableZoom === true;
		this._camera.disableSubFloorCam = cameraConf.disableSubFloorCam === true;

		this._cameraConf = cameraConf;

		this.resetCamera();

		const { autoRotate } = cameraConf;

		if (autoRotate !== undefined) {
			this._camera.useAutoRotationBehavior = true;
			const behaviour = this._camera.autoRotationBehavior;
			if (behaviour !== null) {
				if (autoRotate.idleRotationSpeed !== undefined) {
					behaviour.idleRotationSpeed = autoRotate.idleRotationSpeed;
				}
				if (autoRotate.idleRotationSpinupTime !== undefined) {
					behaviour.idleRotationSpinupTime = autoRotate.idleRotationSpinupTime;
				}
				if (autoRotate.idleRotationWaitTime !== undefined) {
					behaviour.idleRotationWaitTime = autoRotate.idleRotationWaitTime;
				}
				if (autoRotate.zoomStopsAnimation !== undefined) {
					behaviour.zoomStopsAnimation = autoRotate.zoomStopsAnimation;
				}
			}
		} else {
			this._camera.useAutoRotationBehavior = false;
		}
	}

	public addEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "orbitalCameraConfiguration":
				if (this._orbitalCameraConfigurationObservable === undefined) {
					this._orbitalCameraConfigurationObservable = new Observable<
						OrbitalCameraConfigurationProps
					>();
				}
				this._orbitalCameraConfigurationObservable.listen(
					listener as EventListener<T, "orbitalCameraConfiguration">
				);
				break;

			default:
				super.addEventListener(event, listener);
		}
	}

	public removeEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "orbitalCameraConfiguration":
				if (this._orbitalCameraConfigurationObservable === undefined) {
					return;
				}
				this._orbitalCameraConfigurationObservable.stopListen(
					listener as EventListener<T, "orbitalCameraConfiguration">
				);
				break;

			default:
				super.removeEventListener(event, listener);
		}
	}

	public get orbitalCameraConfiguration(): OrbitalCameraConfigurationProps {
		const camera = this._camera;

		return {
			disableZoom: camera.disableZoom,
			minDistance: camera.lowerRadiusLimit || 0,
			maxDistance: camera.upperRadiusLimit || Infinity,
			minYaw: camera.lowerAlphaLimit || -Math.PI,
			maxYaw: camera.upperAlphaLimit || Math.PI,
			minPitch: Math.max(camera.lowerBetaLimit || MIN_LOWER_BETA_LIMIT, MIN_LOWER_BETA_LIMIT),
			maxPitch: Math.min(camera.upperBetaLimit || MAX_UPPER_BETA_LIMIT, MAX_UPPER_BETA_LIMIT),
			...this.cameraConfiguration,
		};
	}

	protected notifyCameraListeners() {
		super.notifyCameraListeners();

		if (this._orbitalCameraConfigurationObservable === undefined) {
			return;
		}

		const cameraConf = this.orbitalCameraConfiguration;

		if (
			this._previousOrbitalCameraConf !== undefined &&
			orbitalCameraConfigurationPropsEquals(this._previousOrbitalCameraConf, cameraConf)
		) {
			return;
		}

		this._orbitalCameraConfigurationObservable.notifyAll(
			cameraConf,
			this._orbitalCameraConfigurationObservable
		);
		this._previousOrbitalCameraConf = cameraConf;
	}

	public get cameraControlObservable() {
		return this._camera.cameraControlObservable;
	}

	protected get contentCenter(): Vector3 {
		return this._camera.target;
	}

	protected handleSizing(force: boolean) {
		super.handleSizing(force);

		if (this._viewportSize === undefined) {
			return false;
		}

		const currentProduct = this.currentProduct;

		const boundingBox =
			currentProduct === undefined ? new CfgBoundingBox() : currentProduct.boundingBox;

		this._camera.setContentBoundingBox(boundingBox, force);

		if (!boundingBox.isEmpty) {
			this._lightRig.scale =
				measureLongestDistanceToCorner(boundingBox, [0, 1, 2]) *
				CONTENT_TO_LIGHT_RIG_SCALE_FACTOR;
		}
	}

	protected refreshCameraNearFar() {
		super.refreshCameraNearFar();
		this._camera.refreshCameraNearFar();
	}

	protected getNeededFrameRender(time: number): boolean {
		return super.getNeededFrameRender(time) || this._camera.frameRenderNeeded();
	}
}
