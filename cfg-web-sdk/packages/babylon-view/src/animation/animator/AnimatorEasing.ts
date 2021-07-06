import {
	AnimationState,
	Animator,
	AnimatorConfig,
	defaultConfig as baseDefaultConfig,
} from "./Animator";
import { EasingFunction, EasingFunctions } from "./EasingFunctions";

export type AnimatorEasingConfig<T> = AnimatorConfig & {
	easing: EasingFunction;
	duration: number;
	startPosition: T;
	endPosition: T;
};

export function getDefaultConfig<T>(empty: T): AnimatorEasingConfig<T> {
	return {
		...baseDefaultConfig,
		startPosition: empty,
		endPosition: empty,
		easing: EasingFunctions.linear,
		duration: 1000,
	};
}

export abstract class AnimatorEasing<T, Config extends AnimatorEasingConfig<T>> extends Animator<
	Config
> {
	run(): void {
		if (!this.isReadyToRun()) {
			return;
		}
		this.state = AnimationState.Waiting;
	}

	tick(now: number, delta: number) {
		if (!this.willTick(now, delta) || this.startTime === undefined) {
			return;
		}
		const progressFraction = (now - this.startTime) / this._config.duration;

		const boundedEased = this._config.easing(Math.max(0, Math.min(1, progressFraction)));

		this.apply(boundedEased);

		if (1 < progressFraction) {
			this.setDead();
		}
	}

	protected setDead() {
		this.state = AnimationState.Dead;
		this.isDoneObservable.notifyAll();
	}

	apply0() {
		this.apply(0);
	}

	protected abstract apply(boundedEased: number): void;
}
