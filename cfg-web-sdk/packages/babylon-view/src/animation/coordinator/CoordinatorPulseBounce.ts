import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Observable } from "@configura/web-utilities";
import { SingleProductView } from "../../view/SingleProductView";
import { SingleProductViewPhaseEvent } from "../../view/SingleProductViewConfiguration";
import { AnimatableObject } from "../AnimatableObject";
import { AnimatorPointToPoint } from "../animator/AnimatorPointToPoint";
import { EasingFunctions } from "../animator/EasingFunctions";
import { CoordinatorCreator } from "./Coordinator";
import {
	CoordinatorPulse,
	CoordinatorPulseConfig,
	defaultConfig as baseDefaultConfig,
} from "./CoordinatorPulse";

export type CoordinatorPulseBounceConfig = CoordinatorPulseConfig & { height: number };

const defaultConfig: CoordinatorPulseBounceConfig = {
	...baseDefaultConfig,
	height: 0.01,
	delay: 40,
	duration: 300,
};

export class CoordinatorPulseBounce extends CoordinatorPulse<CoordinatorPulseBounceConfig> {
	public static getCoordinatorCreator(
		config?: Partial<CoordinatorPulseBounceConfig>
	): CoordinatorCreator {
		return (
			view: SingleProductView,
			phaseObservable: Observable<SingleProductViewPhaseEvent>
		) => {
			return new CoordinatorPulseBounce(view, phaseObservable, config || {});
		};
	}

	protected constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Partial<CoordinatorPulseBounceConfig>
	) {
		super(view, phaseObservable, { ...defaultConfig, ...config });
	}

	async _prepare(node: AnimatableObject, isNewProduct: boolean): Promise<void> {
		const queue = this.getAnimatorQueue(node, true)!;

		const height =
			this._config.height *
			(this.product === undefined ? 1 : Math.pow(this.product.boundingBox.spaceDiagonal, 2));

		const animator = new AnimatorPointToPoint(node, {
			easing: EasingFunctions.makeMirrored(EasingFunctions.easeInSine),
			duration: this._config.duration,
			delay: this._config.delay,
			startPosition: new Vector3(0, 0, 0),
			endPosition: new Vector3(0, 0, height),
		});

		queue.add(animator);
	}
}
