import { DexInt } from "../format/dex/DexInt";

export function eq(a: number, b: number, precision = 1e-6) {
	return Math.abs(a - b) < precision;
}

export function castNumber(s: unknown): number | undefined {
	if (typeof s === "number") {
		return s;
	}
}

export function fcastNumber(s: unknown): number {
	if (typeof s === "number") {
		return s;
	}

	if (s instanceof DexInt) {
		return s.value;
	}

	throw Error(`typeof s: ${typeof s} not number`);
}
