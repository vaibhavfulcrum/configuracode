import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymGFX extends SymComponent {
	id: SymComponentKey = "symGfx";
	props = new Map<string, unknown>();

	load(logger: Logger, obj: DexObj, _env: SymImportEnv, force = false) {
		for (const [key, val] of obj.props.entries()) {
			if (key === "symShadowMode") {
				logger.warn("[SymGFX.load.symShadowMode] not yet implemented");
			}
			this.props.set(key, val);
		}
	}

	invalidation(removed: boolean): SymInv[] | undefined {
		console.warn("[SymGFX.invalidation] not yet implemented");
		return;
	}
}
