export function compareMaps<T, S>(map1: Map<T, S>, map2: Map<T, S>) {
	if (map1.size !== map2.size) {
		return false;
	}
	for (const [key, val] of map1) {
		const testVal = map2.get(key);
		if (testVal !== val || (testVal === undefined && !map2.has(key))) {
			return false;
		}
	}
	return true;
}
