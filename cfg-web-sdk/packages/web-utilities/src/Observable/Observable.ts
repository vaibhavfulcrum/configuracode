export class Observable<T> {
	listeners: { l: (v: T) => void; c: unknown | undefined }[] = [];

	listen = (listener: (v: T) => void, context?: unknown) => {
		this.listeners.push({ l: listener, c: context });
	};

	stopListen = (listener: (v: T) => void) => {
		let index = this.listeners.findIndex((l) => l.l === listener);
		if (index !== -1) {
			this.listeners.splice(index, 1);
		}
	};

	notifyAll = (v: T, context?: unknown) => {
		this.listeners.forEach((l) => {
			if (context && l.c === context) {
				return;
			}
			l.l(v);
		});
	};

	link = (other: Observable<T>) => {
		this.listen((v) => other.notifyAll(v, this), other);
		other.listen((v) => this.notifyAll(v, other), this);
	};

	unlink = (other: Observable<T>) => {
		this.stopListen(other.notifyAll);
		other.stopListen(this.notifyAll);
	};
}
