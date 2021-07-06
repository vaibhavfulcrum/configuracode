import { AnimatableObject } from "../AnimatableObject";
import {
	AnimationState,
	Animator,
	AnimatorConfig,
	defaultConfig as baseDefaultConfig,
} from "./Animator";

export type AnimatorQueueConfig = AnimatorConfig;

const defaultConfig: AnimatorQueueConfig = baseDefaultConfig;

export class AnimatorQueue extends Animator<AnimatorQueueConfig> {
	private animationsQueue: Animator[] = [];

	constructor(node: AnimatableObject, config?: Partial<AnimatorQueueConfig>, type?: string) {
		super(node, { ...defaultConfig, ...config }, type);
	}

	add(animator: Animator) {
		const doneListener = () => {
			animator.stopListenForDone(doneListener);
			this.animationsQueue.shift();
			if (this.animationsQueue.length === 0) {
				this.state = AnimationState.Ready;
				this.isDoneObservable.notifyAll();
				return;
			}
			this.animationsQueue[0].run();
		};
		animator.listenForDone(doneListener);
		this.animationsQueue.push(animator);
	}

	peek(): Animator | undefined {
		return this.animationsQueue[0];
	}

	run(): void {
		if (!this.isReadyToRun()) {
			return;
		}
		const animation = this.peek();
		if (animation === undefined) {
			return;
		}
		this.state = AnimationState.Running;
		animation.run();
	}

	apply0() {
		const animation = this.peek();
		if (animation === undefined) {
			return;
		}
		animation.apply0();
	}

	willTick(now: number, delta: number): boolean {
		const animation = this.peek();
		if (animation === undefined) {
			return false;
		}
		return animation.willTick(now, delta);
	}

	tick(now: number, delta: number): void {
		const animation = this.peek();
		if (animation === undefined) {
			return;
		}
		animation.tick(now, delta);
	}
}
