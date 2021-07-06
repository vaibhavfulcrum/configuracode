export class GenericCache<Key, Item> {
	public _cache = new Map<Key, Item>();

	get(key: Key, createMissing: () => Item) {
		let item = this._cache.get(key);
		if (item !== undefined) {
			return item;
		}

		item = createMissing();
		this._cache.set(key, item);
		return item;
	}

	delete = (key: Key) => {
		return this._cache.delete(key);
	};

	clear = () => {
		this._cache.clear();
	};
}
