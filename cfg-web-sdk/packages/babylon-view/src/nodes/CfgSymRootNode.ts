import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { InspectableType } from "@babylonjs/core/Misc/iInspectable";
import { CfgMaterialMapping, Model, Transform as ModelTransform } from "@configura/web-api";
import { SymGfxMode } from "@configura/web-core/dist/cm/format/cmsym/components/SymComponent";
import { loadSymFile, SymNode } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DetailLevel } from "@configura/web-core/dist/cm/geometry/DetailMask";
import { Logger } from "@configura/web-utilities";
import { CoordinatorWithMeta } from "../animation/coordinator/Coordinator";
import {
	modelTransformsEqual,
	modelTransformToSymTransform,
	symTransformToMatrix as symTransformToBabMatrix,
} from "../utilities/utilities3D";
import { RenderEnv } from "../view/RenderEnv";
import { CfgSymNode } from "./CfgSymNode";

async function loadCachedSymNode(logger: Logger, url: string, renderEnvironment: RenderEnv) {
	return renderEnvironment.symNodeCache.get(url, () => {
		return loadSymFile(logger, url, renderEnvironment.dexManager);
	});
}

function getBestMatchingDetailLevel(
	logger: Logger,
	symNode: SymNode,
	allowedLevels: DetailLevel | DetailLevel[]
): DetailLevel {
	const symReps = symNode.symReps();
	if (symReps === undefined) {
		logger.warn("node has no SymReps", symNode);
		return DetailLevel.undefined;
	}
	const detailMask = symReps.detailMask(SymGfxMode.x3D);
	if (detailMask === undefined) {
		logger.warn("symReps has no DetailMask", symReps);
		return DetailLevel.undefined;
	}
	const detailLevel = detailMask.getBestMatch(allowedLevels);
	if (detailLevel === undefined) {
		logger.warn(
			"No matching DetailLevel found",
			`available:${Array.from(detailMask.detailSet().values())}`,
			`allowed:${allowedLevels}`
		);
		return DetailLevel.undefined;
	}
	return detailLevel || DetailLevel.undefined;
}

export class CfgSymRootNode extends CfgSymNode {
	static async makeCfgSymRoot(
		logger: Logger,
		isForDebug: boolean,
		renderEnvironment: RenderEnv,
		symUrl: string,
		transform: ModelTransform | undefined
	): Promise<CfgSymRootNode | undefined> {
		if (!/.cmsym$/i.test(symUrl)) {
			renderEnvironment.notifyError(
				logger.errorAsObject("Unsupported model URL (not cmsym format): ", symUrl)
			);
			return;
		}

		try {
			const symNode = await loadCachedSymNode(logger, symUrl, renderEnvironment);

			return this.makeCfgSymRootFromSymNode(
				logger,
				renderEnvironment,
				isForDebug,
				symUrl,
				transform,
				symNode
			);
		} catch (e) {
			logger.errorFromCaught(e);
			renderEnvironment.notifyError(
				"Failed to load model-file. Please reload or change selection."
			);
		}
	}

	get cfgClassName(): string {
		return "CfgSymRootNode";
	}

	static async makeCfgSymRootFromSymNode(
		logger: Logger,
		renderEnvironment: RenderEnv,
		isForDebug: boolean,
		symUrl: string,
		transform: ModelTransform | undefined,
		symNode: SymNode
	): Promise<CfgSymRootNode | undefined> {
		if (symNode === undefined) {
			logger.warn("No symNode");
			return;
		}

		const detailLevel = getBestMatchingDetailLevel(
			logger,
			symNode,
			renderEnvironment.allowedDetailLevels
		);
		const node = new CfgSymRootNode(
			renderEnvironment,
			isForDebug,
			detailLevel,
			symNode,
			symUrl,
			transform
		);

		await CfgSymNode.initCfgSymNode(node);

		return node;
	}

	private _destroyed = false;
	private _originalMatrixWithModelTransform: Matrix | undefined;

	private constructor(
		renderEnvironment: RenderEnv,
		private _isForDebug: boolean,
		detailLevel: DetailLevel,
		symNode: SymNode,
		public _symUrl: string,
		modelTransform: ModelTransform | undefined
	) {
		super(renderEnvironment, detailLevel, symNode);
		this.name = "(SymRoot) " + symNode.id;
		this.modelTransform = modelTransform;
		this.initTransform();
	}

	public get isForDebug() {
		return this._isForDebug;
	}

	isSame(model: Model) {
		return (
			this._symUrl === model.uri &&
			((this.modelTransform === undefined && model.t === undefined) ||
				(this.modelTransform !== undefined &&
					model.t !== undefined &&
					modelTransformsEqual(this.modelTransform, model.t)))
		);
	}

	destroy() {
		this._destroyed = true;
	}

	isDestroyed(): boolean {
		return this._destroyed;
	}

	applyGeo(): void {
		if (this._destroyed) {
			throw Error("Apply geo on destroyed node");
		}
		return super.applyGeo();
	}

	async setMaterialsAndLoad(
		areasToMaterials: CfgMaterialMapping,
		animatorCoordinator?: CoordinatorWithMeta
	): Promise<void> {
		if (this._destroyed) {
			throw Error("setMaterials on destroyed node");
		}

		await super.setMaterialsAndLoad(areasToMaterials, animatorCoordinator);
	}

	applyMaterial(): void {
		if (this._destroyed) {
			throw Error("applyMaterial on destroyed node");
		}
		super.applyMaterial();
	}

	private _modelTransform?: ModelTransform;
	private get modelTransform() {
		return this._modelTransform;
	}

	private set modelTransform(value: ModelTransform | undefined) {
		this._modelTransform = value;
		this._originalMatrixWithModelTransform = undefined;
	}

	public get originalMatrix(): Matrix {
		if (this._originalMatrixWithModelTransform === undefined) {
			const originalMatrix = super.originalMatrix;

			let modelMatrix = Matrix.Identity();
			const modelTransform = this.modelTransform;
			if (modelTransform !== undefined) {
				const modelSymTransform = modelTransformToSymTransform(modelTransform);
				modelMatrix = symTransformToBabMatrix(modelSymTransform.transform());
			}

			this._originalMatrixWithModelTransform = modelMatrix.multiply(originalMatrix);
		}
		return this._originalMatrixWithModelTransform;
	}

	protected addInspectorProperties() {
		super.addInspectorProperties();
		this.addInspectableCustomProperty({
			label: "Is for Debug",
			propertyName: "_inspectorIsForDebug",
			type: InspectableType.String,
		});
		this.addInspectableCustomProperty({
			label: "SymUrl",
			propertyName: "_symUrl",
			type: InspectableType.String,
		});
	}

	private get _inspectorIsForDebug() {
		return this._isForDebug ? "Yes" : "No";
	}
}
