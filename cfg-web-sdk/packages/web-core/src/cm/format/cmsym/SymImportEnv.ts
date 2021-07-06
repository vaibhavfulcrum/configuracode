import { Semver } from "../../io/Semver";
import { DexObj } from "../dex/DexObj";
import { SymNode } from "./SymNode";

export class SymImportEnv {
	public sharedNodeMap: Map<DexObj, SymNode>;

	constructor(public fileVersion: Semver) {
		this.sharedNodeMap = new Map();
	}

	copy() {
		return new SymImportEnv(this.fileVersion);
	}
}
