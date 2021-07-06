export function toError(x: unknown): Error {
	return x instanceof Error ? x : Error(`${x}`);
}

export function getErrorMessage(x: unknown): string {
	return x instanceof Error ? x.message : `${x}`;
}

export const abortErrorName = "AbortError";

export function isAbortError(e: any) {
	return e instanceof DOMException && e.name === abortErrorName;
}

export function throwAbortError() {
	throw new DOMException("", abortErrorName);
}

export function throwOnAbort(abortSignal: AbortSignal) {
	if (abortSignal.aborted) {
		throwAbortError();
	}
}
