export function shuffle<T>(items: T[]): T[] {
	return items
		.map((value) => ({
			sort: Math.random(),
			value,
		}))
		.sort((a, b) => a.sort - b.sort)
		.map((item) => item.value);
}

export function count<T>(items: T[], predicate: (item: T) => boolean): number {
	return items.reduce((c, item) => c + (predicate(item) ? 1 : 0), 0);
}

export function someMatch<T>(items: T[], predicate: (left: T, right: T) => boolean): boolean {
	const len = items.length;

	if (len < 2) {
		return false;
	}

	for (let i = 0; i < len - 1; i++) {
		for (let j = i + 1; j < len; j++) {
			if (predicate(items[i], items[j])) {
				return true;
			}
		}
	}
	return false;
}

export function compareArrays<T>(
	left: T[],
	right: T[],
	predicate: (l: T, r: T) => boolean = (l: T, r: T) => l === r,
	strictOrder: boolean = true
) {
	const len = left.length;

	if (len !== right.length) {
		return false;
	}

	if (strictOrder) {
		for (let i = 0; i < len; i++) {
			if (!predicate(left[i], right[i])) {
				return false;
			}
		}
		return true;
	}

	const rightCandidates = right.slice();

	for (const l of left) {
		const i = rightCandidates.findIndex((r) => predicate(l, r));
		if (i === -1) {
			return false;
		}
		rightCandidates.splice(i, 1);
	}
	return true;
}
