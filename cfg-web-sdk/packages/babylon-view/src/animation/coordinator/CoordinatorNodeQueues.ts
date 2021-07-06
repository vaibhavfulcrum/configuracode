import { Observable } from "@configura/web-utilities";
import { SingleProductView } from "../../view/SingleProductView";
import { SingleProductViewPhaseEvent } from "../../view/SingleProductViewConfiguration";
import { AnimatableObject } from "../AnimatableObject";
import { AnimatorQueue } from "../animator/AnimatorQueue";
import { Coordinator, CoordinatorConfig, defaultConfig as baseDefaultConfig } from "./Coordinator";

export type CoordinatorNodeQueuesConfig = CoordinatorConfig & {};

export const defaultConfig: CoordinatorNodeQueuesConfig = { ...baseDefaultConfig };

export abstract class CoordinatorNodeQueues<
	Config extends CoordinatorNodeQueuesConfig
> extends Coordinator<Config> {
	protected animationQueues: AnimatorQueue[] = [];
	protected isFirstRun = true;

	protected constructor(
		view: SingleProductView,
		phaseObservable: Observable<SingleProductViewPhaseEvent>,
		config: Config
	) {
		super(view, phaseObservable, config);
	}

	getAnimatorQueue(node: AnimatableObject, orCreate: boolean = false): AnimatorQueue | undefined {
		let queue = this.animationQueues.find((queue) => queue.node === node);
		if (queue === undefined && orCreate) {
			queue = new AnimatorQueue(node);
			this.animationQueues.push(queue);
		}
		return queue;
	}

	removeAnimatorQueue(queue: AnimatorQueue) {
		const index = this.animationQueues.indexOf(queue);
		if (index < 0) {
			return;
		}
		this.animationQueues.splice(index, 1);
	}

	protected run() {
		if (this.product === undefined) {
			return false;
		}

		if (this.isFirstRun) {
			this.isFirstRun = false;
		}

		this.animationQueues.forEach((o) => {
			o.run();
		});
	}

	willTick(now: number, delta: number): boolean {
		let someWillTick = false;
		for (const o of this.animationQueues) {
			someWillTick = o.willTick(now, delta) || someWillTick;
		}
		return someWillTick;
	}

	tick(now: number, delta: number): void {
		for (const o of this.animationQueues) {
			o.tick(now, delta);
		}
	}
}
