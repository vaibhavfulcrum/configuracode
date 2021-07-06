import { Camera } from "@babylonjs/core/Cameras/camera";
import "@babylonjs/core/Debug/debugLayer";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Scene } from "@babylonjs/core/scene";
import { GMaterial3D } from "@configura/web-core/dist/cm/core3D/GMaterial3D";
import { SymGetMeshEnv } from "@configura/web-core/dist/cm/format/cmsym/components/SymGetMeshEnv";
import { SymMesh } from "@configura/web-core/dist/cm/format/cmsym/components/SymMesh";
import { SymNode } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DexManager } from "@configura/web-core/dist/cm/format/dex/DexManager";
import {
	AggregatedLoadingObservable,
	EventListener,
	isAbortError,
	Observable,
	PromiseCache,
	toError,
} from "@configura/web-utilities";
import { CameraCreator } from "../camera/CameraCreator";
import { getDefaultGradingApplier, GradingApplier } from "../camera/GradingApplier";
import { EngineCreator, getDefaultEngine } from "../engine/EngineCreator";
import { CfgGeometry } from "../geometry/CfgGeometry";
import { getDefaultLightRigCreator } from "../light/DefaultLightRig";
import { LightRig, LightRigCreator } from "../light/LightRigCreator";
import {
	defaultDummyMaterialCreator,
	DummyMaterialCreator,
} from "../material/DummyMaterialCreator";
import { MaterialWithMetaData } from "../material/material";
import { TextureImageWithMetaData } from "../material/texture";
import { CfgContentRootNode } from "../nodes/CfgContentRootNode";
import { getDefaultScene, SceneCreator } from "../scene/SceneCreator";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import {
	BaseViewConfiguration,
	BaseViewEventMap,
	CameraConfigurationProps,
	cameraConfigurationPropsEquals,
	DetailLevel,
	ImageDumpCallback,
} from "./BaseViewConfiguration";
import { RenderEnv } from "./RenderEnv";

// CET coordinate system is Z-up, Babylon is Y-up, both are right handed
// CET coordinates are used in the CfgProductNode and all its children.
export const CET_TO_BABYLON_MATRIX = Matrix.RotationX(-Math.PI / 2);
export const BABYLON_TO_CET_MATRIX = Matrix.RotationX(Math.PI / 2);

const ENABLE_CONTINUOUS_RENDER = false;
const CULL_EMPTY_NODES = true;

/// Load the highest quality meshes by default.
///
/// @remarks We only use "base" as a last fallback. The reason is that even though this LOD level
/// could theoretically include a better version than "super" it is not normally included in CmSym
/// files and never used by CET, which makes it unpredictable. See WRD-387 for a case where it
/// caused problems when it was the first choice.
export const DEFAULT_DETAIL_LEVELS = [
	DetailLevel.super,
	DetailLevel.high,
	DetailLevel.medium,
	DetailLevel.low,
	DetailLevel.base,
];

// As this cache contains items read from a another resource undefined
// is an acceptable cache value representing a value that will not be
// anything but undefined no mather how many times you try.
const geometryCache = new PromiseCache<SymMesh, CfgGeometry | undefined>();
const symNodeCache = new PromiseCache<string, SymNode>();
const materialCache = new PromiseCache<string | GMaterial3D, MaterialWithMetaData>();
const textureImageCache = new PromiseCache<string, TextureImageWithMetaData>();
const derivedNormalMapCache = new PromiseCache<string, HTMLImageElement | undefined>();

// Singletons
const SYM_MESH_ENV = new SymGetMeshEnv();
const DEX_MANAGER = new DexManager("BabylonCanvas");

function getAssetManager(scene: Scene) {
	const assetsManager = new AssetsManager(scene);
	assetsManager.useDefaultLoadingScreen = false;
	return assetsManager;
}

export type BaseViewConstructorOptions<C extends Camera> = {
	canvas: HTMLCanvasElement;
	cameraCreator: CameraCreator<C>;
	engineCreator?: EngineCreator;
	lightRigCreator?: LightRigCreator;
	sceneCreator?: SceneCreator;
	gradingApplier?: GradingApplier;
	dummyMaterialCreator?: DummyMaterialCreator;
};

export abstract class BaseView<C extends Camera, T extends BaseViewEventMap = BaseViewEventMap> {
	protected _destroyed = false;

	protected _viewportSize: [number, number] | undefined;

	protected _canvas: HTMLCanvasElement;

	protected _scene: Scene;
	protected _engine: Engine;
	protected _camera: C;
	protected _lightRig: LightRig;

	protected _inspectorActive: boolean = false;

	private _cameraConfigurationObservable: Observable<CameraConfigurationProps> | undefined;
	private _previousCameraConf: CameraConfigurationProps | undefined;

	protected _contentRoot: CfgContentRootNode;

	private _needsRenderFrame = false;
	private _dumpNextFrameToImage: ImageDumpCallback[] = [];
	private _enginePauseSemaphore = 0;

	protected _errorObservable = new Observable<Error>();
	protected _loadingObservable = new AggregatedLoadingObservable();

	private _renderEnvironmentObservable = new Observable<RenderEnv>();
	protected _renderEnvironment: RenderEnv;

	private _dummyMaterialCreator: DummyMaterialCreator;

	constructor(options: BaseViewConstructorOptions<C>) {
		const {
			canvas,
			cameraCreator,
			engineCreator,
			lightRigCreator,
			sceneCreator,
			gradingApplier,
			dummyMaterialCreator,
		} = options;

		this._canvas = canvas;

		// This workaround prevents canvas long taps to select text near the canvas on iOS
		for (const eventName of [
			"click",
			"dblclick",
			"mousedown",
			"mouseup",
			"mousemove",
			"touchstart",
			"touchend",
			"touchmove",
		]) {
			canvas.addEventListener(eventName, (event) => {
				event.preventDefault();
			});
		}

		const { width, height } = canvas.getBoundingClientRect();
		this._viewportSize = [width, height];

		const engine = (engineCreator || getDefaultEngine)(canvas, width, height);

		const scene = (sceneCreator || getDefaultScene)(engine);
		scene.useRightHandedSystem = true;

		const camera = cameraCreator(scene, canvas);

		(gradingApplier || getDefaultGradingApplier())(camera);

		this._scene = scene;
		this._engine = engine;
		this._camera = camera;

		const lightRig = (lightRigCreator || getDefaultLightRigCreator(true))(scene, camera);
		this._lightRig = lightRig;

		this._dummyMaterialCreator = dummyMaterialCreator || defaultDummyMaterialCreator;

		this._renderEnvironment = {
			scene,
			assetsManager: getAssetManager(scene),
			geometryCache,
			symNodeCache,
			materialCache,
			textureImageCache,
			derivedNormalMapCache,
			lightRig,
			dummyMaterial: this._dummyMaterialCreator(scene, lightRig.lightCount),
			scheduleRerender: this.scheduleRerender.bind(this),
			notifyError: this.notifyError.bind(this),
			symMeshEnv: SYM_MESH_ENV,
			dexManager: DEX_MANAGER,
			cullEmptyNodes: CULL_EMPTY_NODES,
			allowedDetailLevels: DEFAULT_DETAIL_LEVELS,
		};

		this._contentRoot = new CfgContentRootNode(this._renderEnvironment);

		this.setConfiguration({}); // Init the RenderEnv

		requestAnimationFrame(this.browserTick.bind(this));

		// NOTE: As of now we mix view and projection-related properties when we notify, so let's subscribe to both
		this._camera.onViewMatrixChangedObservable.add(this._boundNotifyCameraListeners);
		this._camera.onProjectionMatrixChangedObservable.add(this._boundNotifyCameraListeners);
	}

	destroy() {
		this._destroyed = true;

		this._camera.onViewMatrixChangedObservable.removeCallback(this._boundNotifyCameraListeners);
		this._camera.onProjectionMatrixChangedObservable.removeCallback(
			this._boundNotifyCameraListeners
		);

		this._hideInspector();

		this._camera.dispose();

		geometryCache.clear();
		materialCache.clear();
	}

	public pauseRendering() {
		this._enginePauseSemaphore += 1;
	}

	public resumeRendering() {
		this._enginePauseSemaphore = Math.max(0, this._enginePauseSemaphore - 1);
	}

	private _hideInspector() {
		// The debugLayer getter initializes the backing field _debugLayer, but if we do that before
		// "@babylonjs/inspector" is loaded it will not work properly.
		if (this._scene._debugLayer === undefined) {
			return;
		}

		this._scene.debugLayer.hide();
	}

	public showInspector(target: HTMLElement | undefined) {
		if (target === undefined) {
			this._hideInspector();
		} else {
			if (!(this._scene.debugLayer as any).BJSINSPECTOR) {
				console.warn(
					"@babylonjs/inspector has to be loaded before the Inspector can be shown."
				);
				return;
			}
			this._scene.debugLayer.show({
				globalRoot: target,
				enableClose: false,
			});
		}
		this._inspectorActive = target !== undefined;
	}

	public setConfiguration(configuration: BaseViewConfiguration) {
		if (configuration.allowedDetailLevels !== undefined) {
			this._renderEnvironment.allowedDetailLevels = configuration.allowedDetailLevels;
		}

		this._renderEnvironmentObservable.notifyAll(this._renderEnvironment);
	}

	public get cameraConfiguration(): CameraConfigurationProps {
		return {
			nearClipping: this._camera.minZ,
			farClipping: this._camera.maxZ,
			position: this._camera.position.clone(),
			contentPosition: this.contentCenter,
			fov: this._camera.fov,
			aspect: this._engine.getScreenAspectRatio(),
		};
	}

	protected get contentCenter(): Vector3 {
		const { min, max } = this._contentRoot.getHierarchyBoundingVectors();
		return new CfgBoundingBox(min, max).center;
	}

	// To be able to add/remove event listeners without binding them
	private _boundNotifyCameraListeners = () => {
		this.notifyCameraListeners();
		this.scheduleRerender();
	};

	protected notifyCameraListeners() {
		if (this._cameraConfigurationObservable === undefined) {
			return;
		}
		const cameraConf = this.cameraConfiguration;

		if (
			this._previousCameraConf !== undefined &&
			cameraConfigurationPropsEquals(this._previousCameraConf, cameraConf)
		) {
			return;
		}
		this._cameraConfigurationObservable.notifyAll(
			cameraConf,
			this._cameraConfigurationObservable
		);
		this._previousCameraConf = cameraConf;
	}

	public addEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "cameraConfiguration":
				if (this._cameraConfigurationObservable === undefined) {
					this._cameraConfigurationObservable = new Observable<CameraConfigurationProps>();
				}
				this._cameraConfigurationObservable.listen(
					listener as EventListener<T, "cameraConfiguration">
				);
				break;
			case "renderEnv":
				const l = listener as EventListener<T, "renderEnv">;
				this._renderEnvironmentObservable.listen(l);
				l(this._renderEnvironment);
				break;
			case "error":
				this._errorObservable.listen(listener as EventListener<T, "error">);
				break;
			case "loading":
				this._loadingObservable.listen(listener as EventListener<T, "loading">);
				break;
			default:
				throw Error(`Unknown event-type ${event}`);
		}
	}

	public removeEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "cameraConfiguration":
				if (this._cameraConfigurationObservable === undefined) {
					return;
				}
				this._cameraConfigurationObservable.stopListen(
					listener as EventListener<T, "cameraConfiguration">
				);
				break;
			case "renderEnv":
				this._renderEnvironmentObservable.stopListen(
					listener as EventListener<T, "renderEnv">
				);
				break;
			case "error":
				this._errorObservable.stopListen(listener as EventListener<T, "error">);
				break;
			case "loading":
				this._loadingObservable.stopListen(listener as EventListener<T, "loading">);
				break;
			default:
				throw Error(`Unknown event-type ${event}`);
		}
	}

	public scheduleRerender(dumpNextFrameToImage?: ImageDumpCallback) {
		this._needsRenderFrame = true;
		if (dumpNextFrameToImage !== undefined) {
			this._dumpNextFrameToImage.push(dumpNextFrameToImage);
		}
	}

	protected isContinuousRender(): boolean {
		return ENABLE_CONTINUOUS_RENDER || this._inspectorActive;
	}

	protected getNeededFrameRender(time: number): boolean {
		return this._needsRenderFrame || this.isContinuousRender();
	}

	protected browserTick(time: number) {
		if (this._destroyed) {
			return;
		}

		this._camera.update();

		if (this._enginePauseSemaphore === 0 && this.getNeededFrameRender(time)) {
			this.renderFrame(time);
		}

		requestAnimationFrame(this.browserTick.bind(this));
	}

	protected renderFrame(time: number): void {
		if (this._viewportSize === undefined) {
			console.warn("Size not inited");
			return;
		}

		this._needsRenderFrame = false;

		this.refreshCameraNearFar();

		this._engine.beginFrame();
		this._scene.render();
		this._engine.endFrame();

		if (0 < this._dumpNextFrameToImage.length) {
			const dataUrl = this._canvas.toDataURL("image/png");
			this._dumpNextFrameToImage.forEach((c) => c(dataUrl));
			this._dumpNextFrameToImage.length = 0;
		}
	}

	public resizeViewport(width: number, height: number): void {
		this._viewportSize = [width, height];

		this._canvas.style.width = Math.floor(width) + "px";
		this._canvas.style.height = Math.floor(height) + "px";

		this._engine.resize();

		this.handleSizing(false);

		this.scheduleRerender();
	}

	// Exists to be overridden
	protected handleSizing(force: boolean) {}

	// Exists to be overridden
	protected refreshCameraNearFar() {}

	protected notifyError = (e: any) => {
		if (isAbortError(e)) {
			return;
		}
		this._errorObservable.notifyAll(toError(e));
	};
}
