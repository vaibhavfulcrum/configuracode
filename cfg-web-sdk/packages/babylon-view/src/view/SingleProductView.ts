import { Camera } from "@babylonjs/core/Cameras/camera";
import {
	ApplicationArea,
	CfgMtrlApplication,
	CfgProductConfiguration,
	ProductData,
} from "@configura/web-api";
import { EventListener, getWaitFramesPromise, Observable } from "@configura/web-utilities";
import {
	Coordinator,
	CoordinatorCreator,
	CoordinatorWithMeta,
} from "../animation/coordinator/Coordinator";
import { CoordinatorIdentity } from "../animation/coordinator/CoordinatorIdentity";
import { CameraCreator } from "../camera/CameraCreator";
import { EngineCreator } from "../engine/EngineCreator";
import { LightRigCreator } from "../light/LightRigCreator";
import { DummyMaterialCreator } from "../material/DummyMaterialCreator";
import { CfgProductNode } from "../nodes/CfgProductNode";
import { SceneCreator } from "../scene/SceneCreator";
import { BaseView } from "./BaseView";
import {
	SingleProductViewConfiguration,
	SingleProductViewEventMap,
	SingleProductViewPhase,
	SingleProductViewPhaseEvent,
} from "./SingleProductViewConfiguration";

// The string "loading" can be used if you want to let loading of i.e. models start while
// still waiting for application areas.
export type LoadingOrApplicationAreas = ApplicationArea[] | "loading";

export type SingleProductViewConstructorOptions<C extends Camera> = {
	canvas: HTMLCanvasElement;
	cameraCreator: CameraCreator<C>;
	engineCreator?: EngineCreator;
	lightRigCreator?: LightRigCreator;
	sceneCreator?: SceneCreator;
	dummyMaterialCreator?: DummyMaterialCreator;
};

export class SingleProductView<
	C extends Camera = Camera,
	T extends SingleProductViewEventMap = SingleProductViewEventMap
> extends BaseView<C, T> {
	private _currentProduct: CfgProductNode | undefined;
	private _scheduledForRemoval: CfgProductNode[] = [];

	private _viewPhaseObservable = new Observable<SingleProductViewPhaseEvent>();
	private _currentPhase = SingleProductViewPhase.Idle;

	private _animationCoordinatorCreator: CoordinatorCreator | undefined;
	private _animationCoordinator: Coordinator;

	constructor(options: SingleProductViewConstructorOptions<C>) {
		super(options);

		this._animationCoordinator = new CoordinatorIdentity(this, this._viewPhaseObservable);
	}

	destroy() {
		this._animationCoordinator.destroy();
		super.destroy();
	}

	private scheduleForRemoval(product: CfgProductNode) {
		product.destroy();
		this._scheduledForRemoval.push(product);
	}

	public setConfiguration(configuration: SingleProductViewConfiguration) {
		const animationCoordinatorCreator = configuration.experimentalAnimationCoordinator;
		if (
			animationCoordinatorCreator !== undefined &&
			this._animationCoordinatorCreator !== animationCoordinatorCreator
		) {
			this._animationCoordinatorCreator = animationCoordinatorCreator;
			this._animationCoordinator.destroy();

			this._animationCoordinator = animationCoordinatorCreator(
				this,
				this._viewPhaseObservable
			);
		}

		super.setConfiguration(configuration);
	}

	public get currentProduct(): CfgProductNode | undefined {
		return this._currentProduct;
	}

	public addEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "viewPhase":
				this._viewPhaseObservable.listen(listener as EventListener<T, "viewPhase">);
				break;
			default:
				super.addEventListener(event, listener);
		}
	}

	public removeEventListener<K extends keyof T>(event: K, listener: EventListener<T, K>) {
		switch (event) {
			case "viewPhase":
				this._viewPhaseObservable.stopListen(listener as EventListener<T, "viewPhase">);
				break;
			default:
				super.removeEventListener(event, listener);
		}
	}

	protected getNeededFrameRender(time: number): boolean {
		return (
			super.getNeededFrameRender(time) ||
			this._animationCoordinator.willTick(time, this._engine.getDeltaTime())
		);
	}

	protected renderFrame(time: number): void {
		this._animationCoordinator.tick(time, this._engine.getDeltaTime());
		super.renderFrame(time);
	}

	private notifyPhaseChange = (phase: SingleProductViewPhase) => {
		this._viewPhaseObservable.notifyAll({
			previous: this._currentPhase,
			current: phase,
		});
		this._currentPhase = phase;
	};

	public clearProduct = () => {
		let currentProduct = this._currentProduct;
		if (currentProduct !== undefined) {
			this.notifyPhaseChange(SingleProductViewPhase.RemovePreviousProduct);

			this.scheduleForRemoval(currentProduct);
			this._currentProduct = undefined;
		}
	};

	async flushScheduledForRemove(animationCoordinator?: CoordinatorWithMeta): Promise<void> {
		if (this._scheduledForRemoval.length === 0) {
			return;
		}

		const promises: Promise<void>[] = [];

		while (true) {
			const product = this._scheduledForRemoval.shift();
			if (product === undefined) {
				break;
			}

			promises.push(
				(async () => {
					await product.flushScheduledForRemove(animationCoordinator);
					this._contentRoot.remove(true, product);
				})()
			);
		}

		await Promise.all(promises);

		this.notifyPhaseChange(SingleProductViewPhase.RemovedProduct);
	}

	public loadProduct = (
		applicationAreas: LoadingOrApplicationAreas,
		productConfiguration: CfgProductConfiguration,
		productData: ProductData
	): (() => void) => {
		this.notifyPhaseChange(SingleProductViewPhase.LoadProductCalled);

		const abortController = new AbortController();
		const abortSignal = abortController.signal;

		const loadingToken = this._loadingObservable.startChildLoading();

		const stopLoading = () => {
			this._loadingObservable.stopChildLoading(loadingToken);
		};

		(async () => {
			let isNewProduct = false;

			let currentProduct = this._currentProduct;

			if (currentProduct === undefined || !currentProduct.isSame(productData)) {
				this.clearProduct();

				this.notifyPhaseChange(SingleProductViewPhase.MakeNewProduct);
				currentProduct = CfgProductNode.makeCfgProduct(
					this._renderEnvironment,
					productData
				);

				this.notifyPhaseChange(SingleProductViewPhase.AddNewProduct);

				this._currentProduct = currentProduct;
				this._contentRoot.add(currentProduct);

				isNewProduct = true;
			}

			const animationCoordinator: CoordinatorWithMeta = {
				coordinator: this._animationCoordinator,
				isNewProduct,
			};

			try {
				if (applicationAreas !== "loading") {
					this.notifyPhaseChange(SingleProductViewPhase.SetApplicationAreas);
					currentProduct.setApplicationAreas(
						applicationAreas.map(CfgMtrlApplication.fromApplicationArea)
					);
				}

				this.notifyPhaseChange(SingleProductViewPhase.SetModelsAndLoadGeo);

				await currentProduct.setModelsAndLoadGeo(
					productData.models || [],
					animationCoordinator
				);

				if (isNewProduct) {
					// New products needs resizing before rendering the first time
					this.notifyPhaseChange(SingleProductViewPhase.HandleSizing);
					this.handleSizing(true);
				}

				if (abortSignal.aborted) {
					this.notifyPhaseChange(SingleProductViewPhase.Aborted);
					return;
				}
				const loadMaterialsPromise = currentProduct.setMaterialsAndLoad(
					(productData.mtrlApplications || []).map(
						CfgMtrlApplication.fromApplicationArea
					),
					productConfiguration,
					animationCoordinator
				);

				const doRenderTemporaryMaterials = await Promise.race([
					(async () => {
						await loadMaterialsPromise;
						return false;
					})(),
					(async () => {
						await getWaitFramesPromise(10);
						return true;
					})(),
				]);

				this.notifyPhaseChange(SingleProductViewPhase.ApplyGeo);
				await currentProduct.applyGeo(animationCoordinator);

				this.flushScheduledForRemove(animationCoordinator);

				if (abortSignal.aborted) {
					this.notifyPhaseChange(SingleProductViewPhase.Aborted);
					return;
				}

				if (!isNewProduct) {
					// At this stage, any change in geometry has been applied
					this.notifyPhaseChange(SingleProductViewPhase.HandleSizing);
					this.handleSizing(false);
				}

				if (doRenderTemporaryMaterials) {
					this.scheduleRerender();
				}

				if (abortSignal.aborted) {
					this.notifyPhaseChange(SingleProductViewPhase.Aborted);
					return;
				}

				this.notifyPhaseChange(SingleProductViewPhase.LoadMaterials);

				await loadMaterialsPromise;

				if (abortSignal.aborted) {
					this.notifyPhaseChange(SingleProductViewPhase.Aborted);
					return;
				}

				this.notifyPhaseChange(SingleProductViewPhase.ApplyMaterials);
				this.pauseRendering();
				await currentProduct.applyMaterials();
				this.resumeRendering();

				this.notifyPhaseChange(SingleProductViewPhase.AppliedMaterials);

				this.scheduleRerender();

				stopLoading();

				this.notifyPhaseChange(SingleProductViewPhase.Idle);
			} catch (e) {
				this.notifyPhaseChange(SingleProductViewPhase.Error);
				this.notifyError(e);
				stopLoading();
				// Might result in double-unlock of semaphore, this is OK.
				this.resumeRendering();
			}
		})();

		return () => {
			abortController.abort();
			stopLoading();
		};
	};
}
