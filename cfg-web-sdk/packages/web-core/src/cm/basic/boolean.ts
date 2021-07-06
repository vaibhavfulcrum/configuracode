export function castBoolean(s: unknown): boolean | undefined {
	if (typeof s === "boolean") {
		return s;
	}
}

export function fcastBoolean(s: unknown): boolean {
	if (typeof s === "boolean") {
		return s;
	}
	throw Error(`typeof s: ${typeof s} not boolean`);
}
