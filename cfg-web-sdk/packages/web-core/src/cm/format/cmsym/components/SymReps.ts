import { Logger } from "@configura/web-utilities";
import { DetailLevel, DetailMask } from "../../../geometry/DetailMask";
import { DexInt } from "../../dex/DexInt";
import { DexObj } from "../../dex/DexObj";
import { invalidate } from "../invalidation";
import { SymImportEnv } from "../SymImportEnv";
import { SymInv } from "../SymInv";
import { SymNode } from "../SymNode";
import { SymComponent, SymComponentKey, SymGfxMode } from "./SymComponent";
import { SymPropsInv, SYM_NODE_KEY, SYM_STRUCTURAL_KEY } from "./SymProps";

export class SymReps extends SymComponent {
	static reps3D(detail?: DetailLevel, src?: string) {
		let mask: DetailMask;
		if (detail !== undefined) {
			mask = new DetailMask();
			mask.set(detail);
		} else {
			mask = DetailMask.allSymReps();
		}
		return SymReps.withDetailMask(SymGfxMode.x3D, mask, src);
	}

	static withDetailMask(mode: SymGfxMode, mask: DetailMask, src?: string) {
		const details = new Map<SymGfxMode, DetailMask>();
		details.set(mode, mask);
		return new SymReps(details, src);
	}

	id: SymComponentKey = "symReps";
	_propagatedDetails?: Map<SymGfxMode, DetailMask>;
	invalid: boolean = false;

	constructor(public _details?: Map<SymGfxMode, DetailMask>, src?: string) {
		super(src);
	}

	load(logger: Logger, dexObj: DexObj, _env: SymImportEnv, _force = false) {
		let details = dexObj.get("mask3D");
		if (details instanceof DexInt) {
			const mask = new DetailMask(details.value);
			this.include(SymGfxMode.x3D, mask, false);
		}
		details = dexObj.get("mask2D");
		if (details instanceof DexInt) {
			const mask = new DetailMask(details.value);
			this.include(SymGfxMode.x2D, mask, false);
		}
		const propagated = dexObj.get("propagated");
		if (propagated instanceof DexObj) {
			details = propagated.get("mask3D");
			if (details instanceof DexInt) {
				const mask = new DetailMask(details.value);
				this.includePropagated(SymGfxMode.x3D, mask);
			}
			details = propagated.get("mask2D");
			if (details instanceof DexInt) {
				const mask = new DetailMask(details.value);
				this.includePropagated(SymGfxMode.x2D, mask);
			}
		}
		dexObj.get("containsAny2D");
		dexObj.get("containsAny3D");
	}

	include(mode: SymGfxMode, mask: DetailMask, invalidate = true) {
		if (this._details === undefined) {
			this._details = new Map();
		}
		const dm = this._details.get(mode);
		if (dm !== undefined) {
			mask.include(dm);
		}
		this._details.set(mode, mask);
		if (invalidate) {
			this.invalidate();
		}
	}

	includePropagated(mode: SymGfxMode, mask: DetailMask) {
		if (this._propagatedDetails === undefined) {
			this._propagatedDetails = new Map();
		}
		const dm = this._propagatedDetails.get(mode);
		if (dm !== undefined) {
			mask.include(dm);
		}
		this._propagatedDetails.set(mode, mask);
		// no invalidation needed
	}

	detailLevels(mode: SymGfxMode) {
		return this.detailMask(mode).detailSet();
	}

	detailMask(mode: SymGfxMode): DetailMask {
		const result = new DetailMask();
		if (this._details !== undefined) {
			const mask = this._details.get(mode);
			if (mask !== undefined) {
				result.include(mask);
			}
		}
		if (this._propagatedDetails !== undefined) {
			const mask = this._propagatedDetails.get(mode);
			if (mask !== undefined) {
				result.include(mask);
			}
		}
		return result;
	}

	detailsMap() {
		const combined = new Map<SymGfxMode, DetailMask>();
		if (this._details !== undefined) {
			this._details.forEach((mask, mode) => {
				combined.set(mode, new DetailMask(mask.mask));
			});
		}
		if (this._propagatedDetails !== undefined) {
			this._propagatedDetails.forEach((mask, mode) => {
				let existing = combined.get(mode);
				if (existing !== undefined) {
					existing.include(mask);
				} else {
					existing = new DetailMask(mask.mask);
				}
				combined.set(mode, existing);
			});
		}
		return combined;
	}

	intersects(other: SymReps) {
		if (this.empty() && other.empty()) {
			return true;
		}
		let found = false;
		other.detailsMap().forEach((mask, mode) => {
			if (found) {
				return;
			}
			if (this._propagatedDetails !== undefined) {
				const dm = this._propagatedDetails.get(mode);
				if (dm !== undefined && mask.intersects(dm)) {
					found = true;
				}
			}
			if (this._details !== undefined) {
				const dm = this._details.get(mode);
				if (dm !== undefined) {
					found = true;
				}
			}
		});
		return found;
	}

	empty() {
		if (this._details !== undefined && this._details.size > 0) {
			return false;
		}
		if (this._propagatedDetails !== undefined && this._propagatedDetails.size > 0) {
			return false;
		}
		return true;
	}

	removeAllExcept(other: SymReps) {
		if (this._details !== undefined) {
			this._details.forEach((mask, mode) => {
				const otherMask = other.detailMask(mode);
				// tslint:disable-next-line:no-bitwise
				mask.mask = mask.mask & otherMask.mask;
				if (mask.mask === 0) {
					this._details!.delete(mode);
				} else {
					this._details!.set(mode, mask);
				}
			});
		}
	}

	invalidation(removed: boolean) {
		return [new SymRepsInv(this)];
	}

	invalidate() {
		this.invalid = true;
		if (this._propagatedDetails !== undefined) {
			this._propagatedDetails.clear();
			this._propagatedDetails = undefined;
		}
		if (this.node) {
			const invalidation: SymInv[] = [
				new SymRepsInv(this),
				new SymPropsInv(SYM_NODE_KEY, undefined, true),
				new SymPropsInv(SYM_STRUCTURAL_KEY),
			];
			invalidate(this.node, invalidation);
		}
	}

	toString() {
		const str =
			this._details &&
			Array.from(this._details.entries())
				.map(e => `${e[0]}=${e[1]}`)
				.join(",");
		return `SymReps(${str})`;
	}
}

// tslint:disable-next-line:max-classes-per-file
export class SymRepsInv extends SymInv {
	constructor(public reps: SymReps) {
		super();
	}

	needToInvalidate(node: SymNode) {
		const reps = node.symReps();

		if (reps === undefined) {
			return true;
		} else if (reps.invalid) {
			return false;
		}

		return true;
	}

	skip(node: SymNode) {
		return node === this.reps.node;
	}

	invalidate(node: SymNode) {
		const reps = node.symReps();
		if (reps !== undefined) {
			reps.invalidate();
		} else {
			node.addComponent(invalidSymReps(), false);
		}
	}
}

export function invalidSymReps() {
	const reps = new SymReps();
	reps.invalidate();
	return reps;
}
