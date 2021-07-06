import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Observable } from "@configura/web-utilities";
import { CfgProductNode } from "../../nodes/CfgProductNode";
import { CfgSymRootNode } from "../../nodes/CfgSymRootNode";
import { SingleProductView } from "../../view/SingleProductView";
import {
	SingleProductViewPhase,
	SingleProductViewPhaseEvent,
} from "../../view/SingleProductViewConfiguration";
import { AnimationState } from "../animator/Animator";
import { AnimatorPointToPoint } from "../animator/AnimatorPointToPoint";
import { AnimatorSpin } from "../animator/AnimatorSpin";
import { EasingFunctions } from "../animator/EasingFunctions";
import { CoordinatorCreator } from "./Coordinator";
import {
	CoordinatorNodeQueues,
	CoordinatorNodeQueuesConfig,
	defaultConfig as baseDefaultConfig,
} from "./CoordinatorNodeQueues";

export type CoordinatorDropAndSpinConfig = CoordinatorNodeQueuesConfig & {
	distance: number;
	enterDuration: number;
	exitDuration: number;
	staggerDuration: number;
	spinDuration: number;
};

export const defaultConfig: CoordinatorDropAndSpinConfig = {
	...baseDefaultConfig,
	distance: 5,
	enterDuration: 1000,
	exitDuration: 500,
	staggerDuration: 1000,
	spinDuration: 1500,
};

export class CoordinatorDropAndSpin extends CoordinatorNodeQueues<CoordinatorDropAndSpinConfig> {
	public static getCoordinatorCreator(
		config?: Partial<CoordinatorDropAndSpinConfig>
	): CoordinatorCreator {
		return (
			view: SingleProductView,
			phaseObservable: Observable<SingleProductViewPhaseEvent>
		) => {
			return new CoordinatorDropAndSpin(view, phaseObservable, config || {});
		};
	}

	private constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Partial<CoordinatorDropAndSpinConfig>
	) {
		super(view, phaseObservable, { ...defaultConfig, ...config });

		this.phaseObservable.listen(this.phaseListenerDropAndSpin);
	}

	public destroy() {
		super.destroy();
		this.phaseObservable.stopListen(this.phaseListenerDropAndSpin);
	}

	private phaseListenerDropAndSpin = (phase: SingleProductViewPhaseEvent) => {
		const { previous, current } = phase;

		if (
			previous !== SingleProductViewPhase.ApplyMaterials ||
			current === SingleProductViewPhase.Error ||
			current === SingleProductViewPhase.Aborted
		) {
			return;
		}

		if (this.isFirstRun) {
			this.applyDelay();
		}
		this.run();
	};

	setProduct(product: CfgProductNode) {
		super.setProduct(product);

		let queue = this.getAnimatorQueue(product, true)!;

		const animator = new AnimatorSpin(
			product,
			{
				translationVector: product.boundingBox.center,
				easing: EasingFunctions.easeInOutQuad,
				duration: this._config.spinDuration,
				startPosition: 0,
				endPosition: Math.PI * 2,
			},
			"spin"
		);

		queue.add(animator);
	}

	async prepareForEnter(node: CfgSymRootNode, isNewProduct: boolean): Promise<void> {
		const queue = this.getAnimatorQueue(node, true)!;

		const animator = new AnimatorPointToPoint(
			node,
			{
				easing: EasingFunctions.easeOutCubic,
				duration: this._config.enterDuration,
				startPosition: new Vector3(0, 0, this._config.distance),
			},
			"enter"
		);

		animator.apply0();

		queue.add(animator);
	}

	async prepareForExit(node: CfgSymRootNode): Promise<void> {
		const queue = this.getAnimatorQueue(node);
		if (queue === undefined) {
			return;
		}

		const animator = new AnimatorPointToPoint(
			node,
			{
				easing: EasingFunctions.easeInCubic,
				duration: this._config.exitDuration,
				endPosition: new Vector3(0, 0, -this._config.distance),
			},
			"exit"
		);

		queue.add(animator);

		await new Promise((resolve) => {
			const isDone = () => {
				this.removeAnimatorQueue(queue);
				resolve();
				queue.stopListenForDone(isDone);
			};

			queue.listenForDone(isDone);
		});
	}

	private applyDelay() {
		//So that they fall in in order by z

		const queuesWithDelay = this.animationQueues.filter((q) => {
			if (!(q.node instanceof CfgSymRootNode)) {
				return false;
			}
			const top = q.peek();
			if (top === undefined) {
				return false;
			}
			return top.type === "enter" && top.state === AnimationState.Ready;
		});

		queuesWithDelay.sort((left, right): number => {
			return left.node.boundingBox.minimum.y < right.node.boundingBox.minimum.y ? -1 : 1;
		});

		let delayCounter = 0;
		for (const animationQueue of queuesWithDelay) {
			const top = animationQueue.peek();
			if (top === undefined) {
				continue;
			}
			top.delay = delayCounter;
			delayCounter += this._config.staggerDuration;
		}

		const productQueue = this.animationQueues.find((q) => {
			return q.node instanceof CfgProductNode;
		});
		if (productQueue) {
			const topProductAnimation = productQueue.peek();
			if (topProductAnimation && topProductAnimation.state === AnimationState.Ready) {
				topProductAnimation.delay = delayCounter;
			}
		}
	}
}
