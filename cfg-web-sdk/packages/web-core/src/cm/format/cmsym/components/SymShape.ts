import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymComponent, SymComponentKey } from "./SymComponent";
export class SymShape extends SymComponent {
	id: SymComponentKey = "symShape";

	load(logger: Logger, obj: DexObj, _env: SymImportEnv, force = false) {
		// console.warn("[SymShape.load] not yet implemented");
	}

	invalidation(removed: boolean): SymInv[] | undefined {
		console.warn("[SymShape.invalidation] not yet implemented");
		return;
	}
}
