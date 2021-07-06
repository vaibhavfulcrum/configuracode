import { GenericCache } from "./GenericCache";

export class PromiseCache<Key, Item> extends GenericCache<Key, Promise<Item>> {
	async get(key: Key, createMissing: () => Promise<Item>) {
		return super.get(key, () => {
			const item = createMissing();

			if (item !== undefined) {
				item.catch(() => {
					this.delete(key);
				});
			}

			return item;
		});
	}
}
