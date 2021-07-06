import { DexInternalizedXRef } from "./DexInternalizedXRef";

export class DexXRefTargetFilter {
	target(obj: DexInternalizedXRef) {
		return obj.target();
	}
}
