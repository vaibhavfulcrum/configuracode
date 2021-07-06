import { Semver } from "../../io/Semver";

export class DexVersion {
	constructor(private major: number, private minor: number, private patch: number) {}

	// 1 => this > version
	// 0 => this == version
	// -1 => this < version
	compare(version: DexVersion): 1 | 0 | -1 {
		if (this.major > version.major) {
			return 1;
		} else if (version.major > this.major) {
			return -1;
		} else if (this.minor > version.minor) {
			return 1;
		} else if (version.minor > this.minor) {
			return -1;
		} else if (this.patch > version.patch) {
			return 1;
		} else if (version.patch > this.patch) {
			return -1;
		}
		return 0;
	}

	eq(version: DexVersion): boolean {
		return this.compare(version) === 0;
	}

	gt(version: DexVersion): boolean {
		return this.compare(version) === 1;
	}

	gte(version: DexVersion): boolean {
		return this.compare(version) !== -1;
	}

	lt(version: DexVersion): boolean {
		return this.compare(version) === -1;
	}

	lte(version: DexVersion): boolean {
		return this.compare(version) !== 1;
	}

	toString() {
		return `DexVersion(${this.major},${this.minor},${this.patch})`;
	}

	toSemver(): Semver {
		return new Semver(this.major, this.minor, this.patch);
	}
}
