import { Observable } from "@configura/web-utilities";
import { CfgDeferredMeshNode } from "../../nodes/CfgDeferredMeshNode";
import { CfgProductNode } from "../../nodes/CfgProductNode";
import { CfgSymRootNode } from "../../nodes/CfgSymRootNode";
import { SingleProductView } from "../../view/SingleProductView";
import {
	SingleProductViewPhase,
	SingleProductViewPhaseEvent,
} from "../../view/SingleProductViewConfiguration";

export type CoordinatorCreator = (
	view: SingleProductView,
	phaseObservable: Observable<SingleProductViewPhaseEvent>
) => Coordinator;

export type CoordinatorWithMeta = {
	coordinator: Coordinator;
	isNewProduct: boolean;
};

export type CoordinatorConfig = {};
export const defaultConfig: CoordinatorConfig = {};

export abstract class Coordinator<Config extends CoordinatorConfig = CoordinatorConfig> {
	constructor(
		protected view: SingleProductView,
		protected phaseObservable: Observable<SingleProductViewPhaseEvent>,
		protected _config: Config
	) {
		this.phaseObservable.listen(this.phaseListener);
	}

	private phaseListener = (phase: SingleProductViewPhaseEvent) => {
		const { previous, current } = phase;

		if (
			previous !== SingleProductViewPhase.AddNewProduct ||
			current === SingleProductViewPhase.Error ||
			current === SingleProductViewPhase.Aborted
		) {
			return;
		}

		const currentProduct = this.view.currentProduct;
		if (currentProduct === undefined) {
			return;
		}

		this.setProduct(currentProduct);
	};

	public destroy() {
		this.phaseObservable.stopListen(this.phaseListener);
	}

	protected product: CfgProductNode | undefined;

	protected setProduct(product: CfgProductNode) {
		this.product = product;
	}

	async prepareForEnter(node: CfgSymRootNode, isNewProduct: boolean): Promise<void> {}
	async prepareForExit(node: CfgSymRootNode): Promise<void> {}
	async prepareForMaterialChange(
		node: CfgDeferredMeshNode,
		isNewProduct: boolean
	): Promise<void> {}

	abstract willTick(now: number, delta: number): boolean;
	abstract tick(now: number, delta: number): void;
}
