import { Logger } from "@configura/web-utilities";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymTags extends SymComponent {
	id: SymComponentKey = "symTags";
	main?: string;
	tags?: string;

	load(logger: Logger, obj: DexObj, env: SymImportEnv, force = false) {
		const tags = obj.get("tags");
		if (typeof tags === "string") {
			this.tags = tags;
		}

		const mainTag = obj.get("main");
		if (typeof mainTag === "string") {
			this.main = mainTag;
		}
	}

	level() {
		return 1;
	}
}
