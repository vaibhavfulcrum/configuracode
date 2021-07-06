export function castString(s: unknown): string | undefined {
	if (typeof s === "string") {
		return s;
	}
}

export function fcastString(s: unknown): string {
	if (typeof s === "string") {
		return s;
	}
	throw Error(`typeof s: ${typeof s} not string`);
}
