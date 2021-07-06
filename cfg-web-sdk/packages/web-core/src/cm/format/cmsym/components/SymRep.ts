import { DetailLevel } from "../../../geometry/DetailMask";
import { SymGfxMode } from "./SymComponent";

export class SymRep {
	constructor(private _mode: SymGfxMode, private _detail: DetailLevel) {}

	mode() {
		return this._mode;
	}

	detail() {
		return this._detail;
	}

	is3D() {
		return this._mode === SymGfxMode.x3D;
	}

	is2D() {
		return this._mode === SymGfxMode.x2D;
	}
}
