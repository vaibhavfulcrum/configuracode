import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { InspectableType } from "@babylonjs/core/Misc/iInspectable";
import { CfgMaterialMapping, CfgMtrlSourceWithMetaData } from "@configura/web-api";
import { SymGMaterial } from "@configura/web-core/dist/cm/format/cmsym/components/SymGMaterial";
import { SymTags } from "@configura/web-core/dist/cm/format/cmsym/components/SymTags";
import { SymNode } from "@configura/web-core/dist/cm/format/cmsym/SymNode";
import { DetailLevel } from "@configura/web-core/dist/cm/geometry/DetailMask";
import { LogObservable, LogProducer } from "@configura/web-utilities";
import { AnimatableObject } from "../animation/AnimatableObject";
import { CoordinatorWithMeta } from "../animation/coordinator/Coordinator";
import { CfgBoundingBox } from "../utilities/CfgBoundingBox";
import { symTransformToMatrix } from "../utilities/utilities3D";
import { RenderEnv } from "../view/RenderEnv";
import { CfgDeferredMeshNode } from "./CfgDeferredMeshNode";
import { CfgTransformNode } from "./CfgTransformNode";

function gMaterialIsUseful(gMaterial: SymGMaterial | undefined) {
	return gMaterial !== undefined && gMaterial.gm !== undefined;
}

export class CfgSymNode extends CfgTransformNode implements LogProducer, AnimatableObject {
	static async makeCfgSymNode(
		renderEnvironment: RenderEnv,
		detailLevel: DetailLevel,
		symNode: SymNode,
		symNodeParent?: CfgSymNode
	): Promise<CfgSymNode | undefined> {
		const node = new CfgSymNode(renderEnvironment, detailLevel, symNode, symNodeParent);

		await CfgSymNode.initCfgSymNode(node);
		if (node.isEmpty) {
			if (renderEnvironment.cullEmptyNodes) {
				node.dispose();
				return undefined;
			}
			node.logger.info("Empty node");
		}
		if (node._tag && node._tag.length > 0) {
			node.name += " | " + node._tag;
		}

		return node;
	}

	get cfgClassName(): string {
		return "CfgSymNode";
	}

	static async initCfgSymNode(node: CfgSymNode) {
		node.initTag();
		node.initGMaterial();
		await node.initChildren();
		await node.loadGeo();
	}

	public logger = new LogObservable();

	public _tag: string | undefined;
	private _gMaterial: SymGMaterial | undefined;
	private _symNodeChildren: CfgSymNode[] = [];

	private _deferredMesh: CfgDeferredMeshNode | undefined;
	private _originalMatrix: Matrix | undefined;

	protected constructor(
		renderEnvironment: RenderEnv,
		public _detailLevel: DetailLevel,
		public _symNode: SymNode,
		private _symNodeParent?: CfgSymNode
	) {
		super(renderEnvironment, "(SymNode) " + _symNode.id);

		this.initTransform();
	}

	getChildrenForAnimation(): CfgTransformNode[] {
		const target = super.getChildrenForAnimation();
		if (this._deferredMesh !== undefined) {
			target.push(this._deferredMesh);
		}
		return target;
	}

	private initTag() {
		const symTags = this._symNode.symTags();
		if (symTags instanceof SymTags && symTags.main !== undefined) {
			this._tag = symTags.main;
		}
	}

	private initGMaterial() {
		let gMaterial = this._symNode.symGMaterial();
		if (
			!gMaterialIsUseful(gMaterial) &&
			this._symNodeParent !== undefined &&
			gMaterialIsUseful(this._symNodeParent._gMaterial)
		) {
			gMaterial = this._symNodeParent._gMaterial;
		}
		this._gMaterial = gMaterial;
	}

	public get originalMatrix(): Matrix {
		if (this._originalMatrix === undefined) {
			const symTransform = this._symNode.symTransform();
			if (symTransform === undefined) {
				this._originalMatrix = Matrix.Identity();
			} else {
				const transform = symTransform.transform();
				this._originalMatrix = symTransformToMatrix(transform);
			}
		}

		return this._originalMatrix;
	}

	protected initTransform() {
		this.setPreTransformMatrix(this.originalMatrix);
	}

	private async initChildren() {
		const promises: Promise<unknown>[] = [];

		for (const childNode of (this._symNode.children(this.logger, false, true) || []).values()) {
			promises.push(
				(async () => {
					const childSymNode = await CfgSymNode.makeCfgSymNode(
						this._renderEnvironment,
						this._detailLevel,
						childNode,
						this
					);
					if (childSymNode === undefined) {
						return;
					}
					this._symNodeChildren.push(childSymNode);
					this.add(childSymNode);
				})()
			);
		}

		await Promise.all(promises);
	}

	public get isEmpty() {
		return this._deferredMesh === undefined && this._symNodeChildren.length === 0;
	}

	findMaterial(areasToMaterials: CfgMaterialMapping): CfgMtrlSourceWithMetaData | undefined {
		if (this._tag !== undefined && areasToMaterials.has(this._tag)) {
			return areasToMaterials.get(this._tag);
		}
		if (this._symNodeParent !== undefined) {
			return this._symNodeParent.findMaterial(areasToMaterials);
		}
		return undefined;
	}

	private async loadGeo(): Promise<void> {
		this._deferredMesh = await CfgDeferredMeshNode.makeCfgDeferredMesh(
			this.logger,
			this._renderEnvironment,
			this._detailLevel,
			this._symNode,
			this._gMaterial
		);
		if (this._deferredMesh === undefined) {
			return;
		}
		this._deferredMesh.setEnabled(false);
		this.add(this._deferredMesh);
	}

	applyGeo(): void {
		if (this._deferredMesh !== undefined) {
			this._deferredMesh.setEnabled(true);
		}
		for (const symNodeChild of this._symNodeChildren) {
			symNodeChild.applyGeo();
		}
	}

	isAllMeshMaterialsReady(): boolean {
		return (
			(this._deferredMesh === undefined || this._deferredMesh.isAllMeshMaterialsReady()) &&
			this._symNodeChildren.reduce(
				(a: boolean, c: CfgSymNode) => a && c.isAllMeshMaterialsReady(),
				true
			)
		);
	}

	async setMaterialsAndLoad(
		areasToMaterials: CfgMaterialMapping,
		animatorCoordinator?: CoordinatorWithMeta
	): Promise<void> {
		const promises: Promise<void>[] = [];

		if (this._deferredMesh !== undefined) {
			let mtrlWithMetaData = this.findMaterial(areasToMaterials);
			promises.push(
				this._deferredMesh.setMaterialAndLoad(mtrlWithMetaData, animatorCoordinator)
			);
		}

		for (const symNodeChild of this._symNodeChildren) {
			promises.push(symNodeChild.setMaterialsAndLoad(areasToMaterials, animatorCoordinator));
		}

		await Promise.all(promises);
	}

	applyMaterial() {
		if (this._deferredMesh !== undefined) {
			this._deferredMesh.applyMaterial();
		}
		this._symNodeChildren.forEach((child) => {
			child.applyMaterial();
		});
	}

	get boundingBox(): CfgBoundingBox {
		const bb = this._symNodeChildren.reduce((a, m) => {
			a.expand(m.boundingBox);
			return a;
		}, new CfgBoundingBox());

		if (this._deferredMesh !== undefined) {
			bb.expand(this._deferredMesh.boundingBox);
		}

		bb.applyMatrix(this.originalMatrix);

		return bb;
	}

	protected addInspectorProperties() {
		super.addInspectorProperties();
		this.addInspectableCustomProperty({
			label: "Detail level",
			propertyName: "_detailLevel",
			type: InspectableType.String,
		});
		this.addInspectableCustomProperty({
			label: "Tag",
			propertyName: "_tag",
			type: InspectableType.String,
		});
		this.addInspectableCustomProperty({
			label: "log symNode",
			propertyName: "_inspectorLogSymNode",
			type: InspectableType.Checkbox,
		});
	}

	private get _inspectorLogSymNode() {
		return this._symNode === undefined;
	}

	private set _inspectorLogSymNode(x: boolean) {
		console.log(this._symNode);
	}
}
