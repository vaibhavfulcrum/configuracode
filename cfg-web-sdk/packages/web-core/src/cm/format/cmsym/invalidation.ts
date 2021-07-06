import { InvalidationEnv } from "./InvalidationEnv";
import { SymInv } from "./SymInv";
import { SymNode } from "./SymNode";

export function appendInvalidation(invalidation: SymInv[], node: SymNode, removed: boolean) {
	for (const component of node.components.values()) {
		const inv = component.invalidation(removed);
		if (inv !== undefined) {
			invalidation.push(...inv);
		}
	}

	// if (node.userCached && !node.symUCache) {
	// 	invalidation.push(SymUCacheInv(node, removed));
	// }
}

export function invalidate(node: SymNode, invalidation: SymInv[], xtrace = false) {
	if (invalidation.length === 0) {
		return;
	}

	if (xtrace) {
		console.log(`invalidate(${node.id},${invalidation.length})`);
	}

	const stack = [new InvalidationEnv(node, invalidation)];
	while (stack.length > 0) {
		const env = stack.pop();
		if (env === undefined) {
			continue;
		}

		if (xtrace) {
			env.dump();
		}

		const keep: SymInv[] = [];
		for (const inv of env.invalidation) {
			if (inv.skip(env.node)) {
				if (xtrace) {
					console.log(`${" ".repeat(env.n + 1)}skip origin, ${env.node} ${inv}`);
				}
				keep.push(inv);
			} else if (inv.needToInvalidate(env.node)) {
				if (xtrace) {
					console.log(`${" ".repeat(env.n + 1)}invalidate, ${env.node} ${inv}`);
				}
				inv.invalidate(env.node);
				if (inv.propagate()) {
					keep.push(inv);
				}
			} else {
				if (xtrace) {
					console.log(`${" ".repeat(env.n + 1)}skip, ${env.node} ${inv}`);
				}
			}
		}

		const parents = env.node._parents;
		if (keep.length > 0 && parents && parents.length > 0) {
			if (xtrace) {
				console.log(`${" ".repeat(env.n + 1)}keep, ${keep.length}`);
			}
			for (let i = 0; i < parents.length; i++) {
				const parent = parents[i];
				const inv = i > 0 ? keep.slice() : keep;
				stack.push(new InvalidationEnv(parent, inv, env.n + 2));
			}
		} else {
			if (xtrace && keep.length === 0) {
				console.log(`${" ".repeat(env.n + 1)}keep empty`);
			}
			if (xtrace && (parents === undefined || parents.length === 0)) {
				console.log(`${" ".repeat(env.n + 1)}parents empty`);
			}
		}
	}
}
