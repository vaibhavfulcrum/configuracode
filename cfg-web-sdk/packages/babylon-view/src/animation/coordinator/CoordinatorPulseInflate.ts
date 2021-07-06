import { Observable } from "@configura/web-utilities";
import { SingleProductView } from "../../view/SingleProductView";
import { SingleProductViewPhaseEvent } from "../../view/SingleProductViewConfiguration";
import { AnimatableObject } from "../AnimatableObject";
import { AnimatorScale } from "../animator/AnimatorScale";
import { EasingFunctions } from "../animator/EasingFunctions";
import { CoordinatorCreator } from "./Coordinator";
import {
	CoordinatorPulse,
	CoordinatorPulseConfig,
	defaultConfig as baseDefaultConfig,
} from "./CoordinatorPulse";

export type CoordinatorPulseInflateConfig = CoordinatorPulseConfig & { size: number };

const defaultConfig: CoordinatorPulseInflateConfig = {
	...baseDefaultConfig,
	size: 0.98,
	duration: 400,
};

export class CoordinatorPulseInflate extends CoordinatorPulse<CoordinatorPulseInflateConfig> {
	public static getCoordinatorCreator(
		config?: Partial<CoordinatorPulseInflateConfig>
	): CoordinatorCreator {
		return (
			view: SingleProductView,
			phaseObservable: Observable<SingleProductViewPhaseEvent>
		) => {
			return new CoordinatorPulseInflate(view, phaseObservable, config || {});
		};
	}

	protected constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Partial<CoordinatorPulseInflateConfig>
	) {
		super(view, phaseObservable, { ...defaultConfig, ...config });
	}

	async _prepare(node: AnimatableObject, isNewProduct: boolean): Promise<void> {
		const queue = this.getAnimatorQueue(node, true)!;

		const animator = new AnimatorScale(node, {
			...this._config,
			easing: EasingFunctions.sinBounce(1),
			startPosition: 1,
			endPosition: this._config.size,
			translationVector: node.boundingBox.center,
		});

		queue.add(animator);
	}
}
