import { SymNode } from "./SymNode";

export class SymInv {
	needToInvalidate(node: SymNode): boolean {
		return true;
	}

	skip(node: SymNode): boolean {
		return false;
	}

	propagate(): boolean {
		return true;
	}

	invalidate(node: SymNode): void {}

	toString() {
		return `SymInv()`;
	}
}
