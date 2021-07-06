import { SymNode } from "./SymNode";
import { SymInv } from "./SymInv";

export class InvalidationEnv {
	constructor(public node: SymNode, public invalidation: SymInv[], public n = 0) {}

	dump() {
		console.log(`${" ".repeat(this.n)}${this.node}`);
		for (const inv of this.invalidation) {
			console.log(`${" ".repeat(this.n + 1)}${inv}`);
		}
	}
}
