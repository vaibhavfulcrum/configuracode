import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymLODGroup extends SymComponent {
	id: SymComponentKey = "symLODGroup";

	load(logger: Logger, obj: DexObj, env: SymImportEnv, force = false) {}

	level() {
		return 1;
	}
}
