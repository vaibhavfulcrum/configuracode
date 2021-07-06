import { AccumulatingObservable } from "./AccumulatingObservable";

export enum LogLevel {
	Log = "Log",
	Info = "Info",
	Warn = "Warn",
	Error = "Error",
}
export class LogMessage {
	constructor(public level: LogLevel, public message: any, public optionalParams: any[] = []) {}

	get key(): string {
		return `${this.level}_${this.message}_${this.optionalParams.join("_")}`;
	}

	get levelMessageHash(): number {
		const k = `${this.level}_${this.message}`;

		let hash = 0;
		for (let i = 0; i < k.length; i++) {
			const chr = k.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
		}
		return hash;
	}

	equals(other: LogMessage) {
		return this.key === other.key;
	}
}

export interface Logger {
	addPrebaked(logMessage: LogMessage, toConsoleLog?: boolean): void;
	info(message: any, ...optionalParams: any[]): void;
	warn(message: any, ...optionalParams: any[]): void;
	warnFromCaught(error: any): void;
	error(message: any, ...optionalParams: any[]): void;
	errorFromCaught(error: any): void;
	errorAsObject(message: any, ...optionalParams: any[]): Error;
}

function notInArray(target: LogMessage[], m: LogMessage) {
	return target.every((a) => !a.equals(m));
}

export class LogObservable extends AccumulatingObservable<LogMessage> implements Logger {
	private static _allObservables: LogObservable[] = [];

	private static _accumulate: boolean = true;
	static get accumulate() {
		return this._accumulate;
	}

	static set accumulate(v: boolean) {
		this._accumulate = v;
		if (!v) {
			LogObservable.clear();
		}
	}

	static get allMessages(): LogMessage[] {
		return this._allObservables.reduce<LogMessage[]>((a, o) => {
			o.accumulated.forEach((m) => {
				if (notInArray(a, m)) {
					a.push(m);
				}
			});
			return a;
		}, []);
	}

	static clear() {
		for (const o of this._allObservables) {
			o.clear();
		}
	}

	constructor() {
		super();
		LogObservable._allObservables.push(this);
	}

	addPrebaked = (m: LogMessage, toConsoleLog: boolean = false): void => {
		if (notInArray(this.accumulated, m)) {
			this.notifyAll(m);
		}

		if (toConsoleLog) {
			const message = m.message;
			const optionalParams = m.optionalParams;
			switch (m.level) {
				case LogLevel.Info:
					console.info(message, ...optionalParams);
					break;
				case LogLevel.Warn:
					console.warn(message, ...optionalParams);
					break;
				case LogLevel.Error:
					console.error(message, ...optionalParams);
					break;
				default:
					console.log(message, ...optionalParams);
			}
		}
	};

	private someLog = (level: LogLevel, message?: any, ...optionalParams: any[]) => {
		this.addPrebaked(new LogMessage(level, message, optionalParams), true);
	};

	info(message: any, ...optionalParams: any[]) {
		this.someLog(LogLevel.Info, message, ...optionalParams);
	}

	warn(message: any, ...optionalParams: any[]) {
		this.someLog(LogLevel.Warn, message, ...optionalParams);
	}

	warnFromCaught(e: any): void {
		this.warn(`${e}`);
	}

	error(message: any, ...optionalParams: any[]) {
		this.someLog(LogLevel.Error, message, ...optionalParams);
	}

	errorFromCaught(e: any): void {
		this.error(`${e}`);
	}

	errorAsObject(message: any, ...optionalParams: any[]) {
		this.someLog(LogLevel.Error, message, ...optionalParams);
		return new Error(message + "\n " + optionalParams.join("a"));
	}
}
