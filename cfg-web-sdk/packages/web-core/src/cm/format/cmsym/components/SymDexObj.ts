import { Semver } from "../../../io/Semver";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymDexObj extends SymComponent {
	id: SymComponentKey = "symDexObj";

	constructor(
		public dexObj: DexObj,
		public fileVersion: Semver,
		public importEnv: SymImportEnv,
		src?: string
	) {
		super(src);
	}
}
