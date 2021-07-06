import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { InspectableType } from "@babylonjs/core/Misc/iInspectable";
import {
	aggregateAllMaterialApplications,
	CfgMaterialMapping,
	CfgMtrlApplication,
	CfgProductConfiguration,
	logMaterialMappingToConsole,
	Model,
	ProductData,
} from "@configura/web-api";
import { makeSymFromDex } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DexObj } from "@configura/web-core/dist/cm/format/dex/DexObj";
import { LogObservable, LogProducer, readFileToArrayBuffer } from "@configura/web-utilities";
import { AnimatableObject } from "../animation/AnimatableObject";
import { CoordinatorWithMeta } from "../animation/coordinator/Coordinator";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import { CET_TO_BABYLON_MATRIX } from "../view/BaseView";
import { RenderEnv } from "../view/RenderEnv";
import { CfgSymRootNode } from "./CfgSymRootNode";
import { CfgTransformNode } from "./CfgTransformNode";

function isSymRoot(value: unknown): value is CfgSymRootNode {
	return value instanceof CfgSymRootNode;
}

export class CfgProductNode extends CfgTransformNode implements AnimatableObject, LogProducer {
	static makeCfgProduct(renderEnvironment: RenderEnv, productData: ProductData) {
		return new CfgProductNode(renderEnvironment, productData.sku);
	}

	public logger = new LogObservable();

	private _destroyed = false;

	private _applicationAreas: CfgMtrlApplication[] = [];
	private _productMtrlApplications: CfgMtrlApplication[] = [];
	private _productConfiguration: CfgProductConfiguration | undefined;

	private _debugMtrlApplications: CfgMtrlApplication[] = [];
	public _areasToMaterials: CfgMaterialMapping | undefined;

	private _scheduledForRemoval: CfgSymRootNode[] = [];

	private constructor(renderEnvironment: RenderEnv, private _sku: string) {
		super(renderEnvironment, "(Product) " + _sku);

		this.setPreTransformMatrix(this.originalMatrix);
	}

	get cfgClassName(): string {
		return "CfgProductNode";
	}

	isSame(product: ProductData) {
		return this._sku === product.sku;
	}

	destroy() {
		this._destroyed = true;
		const currentChildren = this.getTypedChildren().filter((c) => !c.isForDebug);
		for (const symRoot of currentChildren) {
			this.scheduleForRemoval(symRoot);
		}
	}

	private scheduleForRemoval(symRoot: CfgSymRootNode) {
		symRoot.destroy();
		this._scheduledForRemoval.push(symRoot);
	}

	isDestroyed(): boolean {
		return this._destroyed;
	}

	setApplicationAreas(applicationAreas: CfgMtrlApplication[]): void {
		this._applicationAreas = applicationAreas;
	}

	async setModelsAndLoadGeo(
		models: Model[],
		coordinatorWithMeta?: CoordinatorWithMeta
	): Promise<void> {
		if (models === undefined) {
			return;
		}

		const toAddModels = models.slice();

		const currentChildren = this.getTypedChildren().filter((c) => !c.isForDebug);

		for (const symRoot of currentChildren) {
			const modelIndex = toAddModels.findIndex((m) => symRoot.isSame(m));

			if (modelIndex === -1) {
				// Not found, remove
				this.scheduleForRemoval(symRoot);
			} else {
				// Found, no need to change anything
				toAddModels.splice(modelIndex, 1);
			}
		}

		const addedSymRoots: CfgSymRootNode[] = [];

		const nodeTreeUpdatedPromises = toAddModels.map(async (model) => {
			const symUrl = model.uri;
			const transform = model.t;

			const symRoot = await CfgSymRootNode.makeCfgSymRoot(
				this.logger,
				false,
				this._renderEnvironment,
				symUrl,
				transform
			);

			if (symRoot === undefined) {
				return;
			}

			addedSymRoots.push(symRoot);
		});

		await Promise.all(nodeTreeUpdatedPromises);

		for (const symRoot of addedSymRoots) {
			this.add(symRoot);
		}

		for (const symRoot of addedSymRoots) {
			if (coordinatorWithMeta !== undefined) {
				const c = coordinatorWithMeta.coordinator;
				await c.prepareForEnter.bind(c)(symRoot, coordinatorWithMeta.isNewProduct);
			}
		}
	}

	async flushScheduledForRemove(animationCoordinator?: CoordinatorWithMeta): Promise<void> {
		const promises: Promise<void>[] = [];
		while (true) {
			const symRoot = this._scheduledForRemoval.shift();
			if (symRoot === undefined) {
				break;
			}

			promises.push(
				(async () => {
					if (animationCoordinator !== undefined) {
						const c = animationCoordinator.coordinator;
						await c.prepareForExit.bind(c)(symRoot);
					}
					this.remove(true, symRoot);
				})()
			);
		}

		await Promise.all(promises);
	}

	isAllMeshMaterialsReady(): boolean {
		return this.getTypedChildren().reduce(
			(a: boolean, c: CfgSymRootNode) => a && c.isAllMeshMaterialsReady(),
			true
		);
	}

	async awaitAllMeshMaterialsReady() {
		return new Promise((resolve, reject) => {
			let maxTries = 60 * 60; // Assuming 60 fps this gives a minute, which is absurdly long
			const frame = () => {
				if (this.isAllMeshMaterialsReady()) {
					resolve();
					return;
				}
				if (maxTries === 0) {
					reject("Materials not ready in time");
					return;
				}
				window.requestAnimationFrame(frame);
				maxTries--;
			};
			frame();
		});
	}

	async setMaterialsAndLoad(
		productMtrlApplications: CfgMtrlApplication[],
		productConfiguration: CfgProductConfiguration,
		animationCoordinator?: CoordinatorWithMeta
	) {
		this._productMtrlApplications = productMtrlApplications;
		this._productConfiguration = productConfiguration;

		await this.aggregateMaterialsPushToChildrenAndLoad(animationCoordinator);
	}

	async aggregateMaterialsPushToChildrenAndLoad(
		animationCoordinator?: CoordinatorWithMeta
	): Promise<void> {
		if (this._applicationAreas === undefined || this._productConfiguration === undefined) {
			return;
		}

		const areasToMaterials = aggregateAllMaterialApplications(
			this._applicationAreas,
			this._productMtrlApplications,
			this._productConfiguration,
			this._debugMtrlApplications
		);

		this._areasToMaterials = areasToMaterials;
		await this.pushMaterialToChildrenAndLoad(animationCoordinator);
	}

	async pushMaterialToChildrenAndLoad(animationCoordinator?: CoordinatorWithMeta): Promise<void> {
		const areasToMaterials = this._areasToMaterials;
		if (areasToMaterials === undefined) {
			return;
		}

		await Promise.all(
			this.getTypedChildren().map((child) =>
				child.setMaterialsAndLoad(areasToMaterials, animationCoordinator)
			)
		);
	}

	private getTypedChildren(): CfgSymRootNode[] {
		return this.getChildren()
			.filter(isSymRoot)
			.filter((c) => !c.isDestroyed());
	}

	async applyGeo(animationCoordinator?: CoordinatorWithMeta): Promise<void> {
		this.getTypedChildren().forEach((child) => {
			child.applyGeo();
		});

		await this.awaitAllMeshMaterialsReady();

		this.flushScheduledForRemove(animationCoordinator);
	}

	async applyMaterials(): Promise<void> {
		this.getTypedChildren().forEach((child) => {
			child.applyMaterial();
		});
		await this.awaitAllMeshMaterialsReady();
	}

	get originalMatrix(): Matrix {
		return CET_TO_BABYLON_MATRIX.clone();
	}

	public async _applyDebugDexObjs(dexObjs: Promise<DexObj>[]) {
		const renderEnvironment = this._renderEnvironment;

		const symRootPromises = dexObjs
			.map(async (d) => makeSymFromDex(this.logger, await d))
			.map(async (s) =>
				CfgSymRootNode.makeCfgSymRootFromSymNode(
					this.logger,
					renderEnvironment,
					true,
					"",
					undefined,
					await s
				)
			);

		const allSymRoots = await Promise.all(symRootPromises);

		allSymRoots.forEach((symRoot) => {
			if (symRoot === undefined) {
				return;
			}
			this.add(symRoot);
		});

		await this.applyGeo();
		await this.pushMaterialToChildrenAndLoad();
		await this.applyMaterials();

		renderEnvironment.scheduleRerender();
	}

	public async _addDebugMtrlApplication(debugMtrlApplication: CfgMtrlApplication): Promise<void> {
		this._debugMtrlApplications.push(debugMtrlApplication);

		await this.aggregateMaterialsPushToChildrenAndLoad();

		this.applyMaterials();

		this._renderEnvironment.scheduleRerender();
	}

	public get boundingBox(): CfgBoundingBox {
		const bb = this.getTypedChildren().reduce((a, m) => {
			a.expand(m.boundingBox);
			return a;
		}, new CfgBoundingBox());
		bb.applyMatrix(this.originalMatrix);
		return bb;
	}

	protected addInspectorProperties() {
		super.addInspectorProperties();
		this.addInspectableCustomProperty({
			label: "log materialMappings",
			propertyName: "_inspectorLogMaterialMappings",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "Add material to mapping from File",
			propertyName: "_inspectorAddMaterialToMaterialMappingFromFile",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "Add material to mapping from Url",
			propertyName: "_inspectorAddMaterialToMaterialMappingFromUrl",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "Add CmSym from File",
			propertyName: "_inspectorAddCmSymFile",
			type: InspectableType.Checkbox,
		});
		this.addInspectableCustomProperty({
			label: "Add CmSym from Url",
			propertyName: "_inspectorAddCmSymUrl",
			type: InspectableType.Checkbox,
		});
	}

	private get _inspectorLogMaterialMappings() {
		return this._areasToMaterials === undefined;
	}

	private set _inspectorLogMaterialMappings(x: boolean) {
		if (this._areasToMaterials === undefined) {
			return;
		}
		logMaterialMappingToConsole(this._areasToMaterials);
	}

	private get _inspectorAddMaterialToMaterialMappingFromFile() {
		return this._areasToMaterials === undefined;
	}

	private set _inspectorAddMaterialToMaterialMappingFromFile(x: boolean) {
		if (this._areasToMaterials === undefined) {
			return;
		}

		const tag = window.prompt("Please provide a Tag for the mapping");

		if (tag === null || tag.trim().length === 0) {
			alert("You must provide a tag for the mapping");
			return;
		}

		const fileUpload = document.createElement("input");
		fileUpload.type = "file";
		fileUpload.style.display = "none";
		const body = document.getElementsByTagName("body")[0];
		body.appendChild(fileUpload);

		fileUpload.addEventListener("change", (event) => {
			(async () => {
				const files = fileUpload.files;

				if (files !== null) {
					const mtrlApplicationPromises = Array.from(files)
						.map(readFileToArrayBuffer)
						.map(async (bufferAndNamePromise) => {
							const bufferAndName = await bufferAndNamePromise;
							return CfgMtrlApplication.fromBufferForDebug(
								[tag],
								bufferAndName.fileName,
								bufferAndName.buffer
							);
						});

					const mtrlApplications = await Promise.all(mtrlApplicationPromises);

					mtrlApplications.forEach((mtrlApplication) => {
						this._addDebugMtrlApplication(mtrlApplication);
					});
				}

				body.removeChild(fileUpload);
			})();
		});

		fileUpload.click();
	}

	private get _inspectorAddMaterialToMaterialMappingFromUrl() {
		return this._areasToMaterials === undefined;
	}

	private set _inspectorAddMaterialToMaterialMappingFromUrl(x: boolean) {
		if (this._areasToMaterials === undefined) {
			return;
		}

		const tag = window.prompt("Please provide a Tag for the mapping");

		if (tag === null || tag.trim().length === 0) {
			alert("You must provide a tag for the mapping");
			return;
		}

		const url = window.prompt("Please provide a material-url");

		if (url === null || url.trim().length === 0) {
			alert("You must provide an URL to a material-file");
			return;
		}

		const mtrlApplication = CfgMtrlApplication.fromUrlForDebug([tag], url);
		this._addDebugMtrlApplication(mtrlApplication);
	}

	private get _inspectorAddCmSymFile() {
		return false;
	}

	private set _inspectorAddCmSymFile(x: boolean) {
		const fileUpload = document.createElement("input");
		fileUpload.type = "file";
		fileUpload.style.display = "none";
		const body = document.getElementsByTagName("body")[0];
		body.appendChild(fileUpload);

		fileUpload.addEventListener("change", (event) => {
			const files = fileUpload.files;

			if (files !== null) {
				const dexPromises = Array.from(files)
					.map(readFileToArrayBuffer)
					.map(async (bufferAndNamePromise) => {
						const bufferAndName = await bufferAndNamePromise;
						return this._renderEnvironment.dexManager.arrayBufferToDexObj(
							this.logger,
							"",
							bufferAndName.buffer
						);
					});

				this._applyDebugDexObjs(dexPromises);
			}

			body.removeChild(fileUpload);
		});

		fileUpload.click();
	}

	private get _inspectorAddCmSymUrl() {
		return false;
	}

	private set _inspectorAddCmSymUrl(x: boolean) {
		const url = window.prompt("Please provide a CmSym-url");

		if (url === null || url.trim().length === 0) {
			alert("You must provide an URL to a CmSym-file");
			return;
		}

		const dexObj = this._renderEnvironment.dexManager.load(this.logger, url);

		this._applyDebugDexObjs([dexObj]);
	}
}
