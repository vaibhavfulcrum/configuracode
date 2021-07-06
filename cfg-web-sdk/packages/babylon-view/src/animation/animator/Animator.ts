import { Observable } from "@configura/web-utilities";
import { AnimatableObject } from "../AnimatableObject";

export enum AnimationState {
	Ready = 1,
	Waiting = 2,
	Running = 3,
	Dead = 4,
}

export type AnimatorConfig = {
	delay: number;
};

export const defaultConfig: AnimatorConfig = {
	delay: 0,
};

export abstract class Animator<Config extends AnimatorConfig = AnimatorConfig> {
	private _state: AnimationState = AnimationState.Ready;
	protected startTime: number | undefined;

	constructor(public node: AnimatableObject, protected _config: Config, private _type?: string) {}

	abstract run(): void;

	isReadyToRun(): boolean {
		return this._state === AnimationState.Ready;
	}

	protected enforceIsReady() {
		if (this.state !== AnimationState.Ready) {
			throw Error("Can not change running animation");
		}
	}

	set delay(delay: number) {
		this.enforceIsReady();
		this._config.delay = delay;
	}

	abstract apply0(): void;

	willTick(now: number, delta: number): boolean {
		if (this.state === AnimationState.Waiting) {
			if (this.startTime === undefined) {
				this.startTime = now + this._config.delay;
			}
			if (this.startTime <= now) {
				this.state = AnimationState.Running;
			}
		}

		return this.state === AnimationState.Running;
	}

	abstract tick(now: number, delta: number): void;

	protected isDoneObservable: Observable<void> = new Observable<void>();
	listenForDone(doneCallback: () => void): void {
		this.isDoneObservable.listen(doneCallback);
	}

	stopListenForDone(doneCallback: () => void): void {
		this.isDoneObservable.stopListen(doneCallback);
	}

	get type(): string | undefined {
		return this._type;
	}

	get state(): AnimationState {
		return this._state;
	}

	set state(state: AnimationState) {
		this._state = state;
	}
}
