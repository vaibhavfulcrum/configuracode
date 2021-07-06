import { Observable } from "@configura/web-utilities";
import { CfgDeferredMeshNode } from "../../nodes/CfgDeferredMeshNode";
import { CfgSymRootNode } from "../../nodes/CfgSymRootNode";
import { SingleProductView } from "../../view/SingleProductView";
import {
	SingleProductViewPhase,
	SingleProductViewPhaseEvent,
} from "../../view/SingleProductViewConfiguration";
import { AnimatableObject } from "../AnimatableObject";
import {
	CoordinatorNodeQueues,
	CoordinatorNodeQueuesConfig,
	defaultConfig as baseDefaultConfig,
} from "./CoordinatorNodeQueues";

export type CoordinatorPulseConfig = CoordinatorNodeQueuesConfig & {
	duration: number;
	delay: number;
	doForNewProducts: boolean;
};

export const defaultConfig: CoordinatorPulseConfig = {
	...baseDefaultConfig,
	duration: 1000,
	delay: 50,
	doForNewProducts: false,
};

export abstract class CoordinatorPulse<
	Config extends CoordinatorPulseConfig
> extends CoordinatorNodeQueues<Config> {
	protected constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Config
	) {
		super(view, phaseObservable, config);
		this.phaseObservable.listen(this.phaseListenerPulse);
	}

	public destroy() {
		super.destroy();
		this.phaseObservable.stopListen(this.phaseListenerPulse);
	}

	private phaseListenerPulse = (phase: SingleProductViewPhaseEvent) => {
		const { previous, current } = phase;

		if (
			previous !== SingleProductViewPhase.AppliedMaterials ||
			current === SingleProductViewPhase.Error ||
			current === SingleProductViewPhase.Aborted
		) {
			return;
		}

		this.run();
	};

	protected abstract async _prepare(node: AnimatableObject, isNewProduct: boolean): Promise<void>;

	async prepareForEnter(node: CfgSymRootNode, isNewProduct: boolean): Promise<void> {
		if (!this._config.doForNewProducts && isNewProduct) {
			return;
		}
		await this._prepare(node, isNewProduct);
	}

	async prepareForMaterialChange(
		node: CfgDeferredMeshNode,
		isNewProduct: boolean
	): Promise<void> {
		if (isNewProduct) {
			return;
		}
		await this._prepare(node, isNewProduct);
	}
}
