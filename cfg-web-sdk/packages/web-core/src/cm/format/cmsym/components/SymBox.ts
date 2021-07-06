import { Logger } from "@configura/web-utilities";
import { fcastNumber } from "../../../basic/number";
import { Box } from "../../../geometry/Box";
import { Point } from "../../../geometry/Point";
import { DexObj } from "../../dex/DexObj";
import { SymImportEnv } from "../SymImportEnv";
import { SymComponent, SymComponentKey } from "./SymComponent";

export class SymBox extends SymComponent {
	id: SymComponentKey = "symBox";

	constructor(private box?: Box, src?: string) {
		super(src);
	}

	load(logger: Logger, obj: DexObj, _env: SymImportEnv, force = false) {
		const p0 = Point.cast(obj.get("p0"));
		const p1 = Point.cast(obj.get("p1"));
		if (p0 !== undefined && p1 !== undefined) {
			this.box = new Box(p0, p1);
			return;
		}

		const w = fcastNumber(obj.get("w"));
		const d = fcastNumber(obj.get("d"));
		const h = fcastNumber(obj.get("h"));
		this.box = new Box(new Point(0, 0, 0), new Point(w, d, h));
	}
}
