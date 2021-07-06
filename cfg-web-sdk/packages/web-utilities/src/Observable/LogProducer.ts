import { LogObservable } from "./LogObservable";

export interface LogProducer {
	logger: LogObservable;
}

export function isLogProducer(object: unknown): object is LogProducer {
	return (
		typeof object === "object" &&
		object !== null &&
		"logger" in object &&
		(object as any).logger instanceof LogObservable
	);
}
