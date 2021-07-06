export function encodeURIComponents(...components: (string | number | boolean)[]) {
	return components.map(encodeURIComponent).join("/");
}

export function mapQueryString(query: string): Map<string, string> {
	if (query[0] === "?") {
		query = query.substr(1);
	}

	return query.split("&").reduce((result, keyValueString) => {
		const split = keyValueString.split("=");
		if (split.length === 2) {
			result.set(split[0], decodeURIComponent(split[1]));
		}
		return result;
	}, new Map<string, string>());
}

export function unmapQueryString(query: Map<string, string>): string {
	return Array.from(query)
		.map((kv) => `${kv[0]}=${encodeURIComponent(kv[1])}`)
		.join("&");
}
