import { shuffle } from "./utilitiesArray";

export type Matcher = {
	mode: "exact" | "all";
	value: string;
};
export type Picker = { mode: "random" | "first"; value: number };

export type FilterMode = Matcher["mode"] | Picker["mode"];
export type Filter = Matcher | Picker;

export type Match<T> = {
	values: string[];
	matching: T[];
};

export type Filters<T> = { [K in keyof T]: Filter };
export type Matches<T> = { [K in keyof T]: Match<T> };

export function validateFilter(mode: string, value: string): Filter {
	if (mode === "all") {
		return { mode, value: "-" };
	} else if (mode === "exact") {
		return { mode, value };
	} else if (mode === "random" || mode === "first") {
		const parsed = parseInt(value, 10);
		return { mode, value: isNaN(parsed) ? 0 : parsed };
	} else {
		console.error("invalid mode!", mode);
		return { mode: "exact", value: "-" };
	}
}

export function match<K extends string, T extends { [_ in K]: string }>(
	key: K,
	filter: Filter,
	items: T[]
): Match<T> {
	const values = Array.from(new Set(items.map((p) => p[key])));

	if (filter.mode === "exact") {
		let { value } = filter;
		let matching = items;
		if (value !== "-") {
			matching = items.filter((p) => p[key] === value);
		}
		return { values, matching };
	} else {
		return { values, matching: items };
	}
}

export function pick<T>(filter: Filter, items: T[]) {
	if (filter.mode === "random") {
		items = shuffle(items);
	}

	if ((filter.mode === "first" || filter.mode === "random") && filter.value > 0) {
		items = items.slice(0, filter.value);
	}

	return items;
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}
