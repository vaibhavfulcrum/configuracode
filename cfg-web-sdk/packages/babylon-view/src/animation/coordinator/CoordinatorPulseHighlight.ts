import { Observable } from "@configura/web-utilities";
import { SingleProductView } from "../../view/SingleProductView";
import { SingleProductViewPhaseEvent } from "../../view/SingleProductViewConfiguration";
import { AnimatableObject } from "../AnimatableObject";
import {
	AnimatorHighlight,
	AnimatorHighlightConfig,
	defaultConfig as animatorHighlightDefaultConfig,
} from "../animator/AnimatorHighlight";
import { EasingFunctions } from "../animator/EasingFunctions";
import { CoordinatorCreator } from "./Coordinator";
import {
	CoordinatorPulse,
	CoordinatorPulseConfig,
	defaultConfig as baseDefaultConfig,
} from "./CoordinatorPulse";

export type CoordinatorPulseHighlightConfig = CoordinatorPulseConfig & AnimatorHighlightConfig;

const defaultConfig: CoordinatorPulseHighlightConfig = {
	...baseDefaultConfig,
	...animatorHighlightDefaultConfig,
};

export class CoordinatorPulseHighlight extends CoordinatorPulse<CoordinatorPulseHighlightConfig> {
	public static getCoordinatorCreator(
		config?: Partial<CoordinatorPulseHighlightConfig>
	): CoordinatorCreator {
		return (
			view: SingleProductView,
			phaseObservable: Observable<SingleProductViewPhaseEvent>
		) => {
			return new CoordinatorPulseHighlight(view, phaseObservable, config || {});
		};
	}

	protected constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Partial<CoordinatorPulseHighlightConfig>
	) {
		super(view, phaseObservable, { ...defaultConfig, ...config });
	}

	async _prepare(node: AnimatableObject, isNewProduct: boolean): Promise<void> {
		const queue = this.getAnimatorQueue(node, true)!;

		const width =
			this._config.width *
			(this.product === undefined ? 1 : Math.pow(this.product.boundingBox.spaceDiagonal, 2));

		const config = {
			...this._config,
			width,
			easing: EasingFunctions.makeMirrored(EasingFunctions.easeInQuart),
			startPosition: 0,
		};

		const animator = new AnimatorHighlight(node, config);

		animator.apply0();

		queue.add(animator);
	}
}
