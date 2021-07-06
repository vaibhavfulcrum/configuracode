/// The CmSym specification states that only low, medium, high, super and base are allowed.
enum DetailLevel {
	lousy = 0,
	low = 1,
	medium = 2,
	high = 3,
	super = 4,
	outline = 5,
	base = 10,
	invisible = 254,
	undefined = 255,
}

// tslint:disable:no-bitwise
class DetailMask {
	static withDetailSet(details: Set<DetailLevel>) {
		const mask = new DetailMask();
		mask.includeSet(details);
		return mask;
	}

	static allSymReps() {
		return new DetailMask(527);
	}

	constructor(public mask = 0) {}

	include(mask: DetailMask) {
		this.mask = this.mask | mask.mask;
	}

	includeSet(details: Set<DetailLevel>) {
		details.forEach((level) => {
			this.set(level);
		});
	}

	set(level: DetailLevel) {
		const levelBitRepresentation = level > 0 ? 1 << (level - 1) : 0;
		this.mask = this.mask | levelBitRepresentation;
	}

	intersects(other: DetailMask) {
		return (this.mask & other.mask) > 0;
	}

	includes(level: DetailLevel) {
		return (this.mask & (1 << (level - 1))) !== 0;
	}

	low() {
		return (this.mask & (1 << (DetailLevel.low - 1))) !== 0;
	}

	medium() {
		return (this.mask & (1 << (DetailLevel.medium - 1))) !== 0;
	}

	high() {
		return (this.mask & (1 << (DetailLevel.high - 1))) !== 0;
	}

	xsuper() {
		return (this.mask & (1 << (DetailLevel.super - 1))) !== 0;
	}

	base() {
		return (this.mask & (1 << (DetailLevel.base - 1))) !== 0;
	}

	detailSet(): Set<DetailLevel> {
		const levels = new Set<DetailLevel>();

		if (this.low()) {
			levels.add(DetailLevel.low);
		}
		if (this.medium()) {
			levels.add(DetailLevel.medium);
		}
		if (this.high()) {
			levels.add(DetailLevel.high);
		}
		if (this.xsuper()) {
			levels.add(DetailLevel.super);
		}
		if (this.base()) {
			levels.add(DetailLevel.base);
		}

		return levels;
	}

	/// Goes through the supplied DetailLevels and returns the first one that is included in this
	/// DetailMask. Returns undefined if no match was found.
	getBestMatch(levels: DetailLevel | DetailLevel[]): DetailLevel | undefined {
		return (levels instanceof Array ? levels : [levels]).find((level) => this.includes(level));
	}

	toString() {
		const set = Array.from(this.detailSet().values()).join(",");
		return `DetailMask(detailSet=${set})`;
	}
}

export { DetailLevel, DetailMask };
