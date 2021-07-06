import { Observable } from "./Observable";

export class AccumulatingObservable<T> extends Observable<T> {
	constructor() {
		super();

		this.listen((m) => {
			this._accumulated.push(m);
			this.accumulatedObservable.notifyAll(this.accumulated);
		});
	}

	private _accumulated: T[] = [];
	public get accumulated(): T[] {
		return this._accumulated;
	}

	private accumulatedObservable = new Observable<T[]>();

	listenForAccumulated = (listener: (v: T[]) => void) => {
		this.accumulatedObservable.listen(listener);
		listener(this._accumulated);
	};

	stopListenForAccumulated = (listener: (v: T[]) => void) => {
		this.accumulatedObservable.stopListen(listener);
	};

	clear = () => {
		this._accumulated.length = 0;
	};
}
