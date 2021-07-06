import { fcastNumber } from "../basic/number";
import { DexObj } from "../format/dex/DexObj";

export class Semver {
	public major: number;
	public minor: number;
	public patch: number;
	public preRelease?: string;
	public build?: string;

	constructor(major: number, minor: number, patch: number, preRelease?: string) {
		this.major = major;
		this.minor = minor;
		this.patch = patch;
		this.preRelease = preRelease;
	}

	static fromDex(obj: DexObj) {
		if (obj.type !== "Semver") {
			throw Error("[toSemver] obj.type is not Semver");
		}

		const semver = new Semver(
			fcastNumber(obj.get("major")),
			fcastNumber(obj.get("minor")),
			fcastNumber(obj.get("patch"))
		);

		return semver;
	}

	// 1 => this > version
	// 0 => this == version
	// -1 => this < version
	compare(version: Semver): 1 | 0 | -1 {
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

	eq(version: Semver): boolean {
		return this.compare(version) === 0;
	}

	gt(version: Semver): boolean {
		return this.compare(version) === 1;
	}

	gte(version: Semver): boolean {
		return this.compare(version) !== -1;
	}

	lt(version: Semver): boolean {
		return this.compare(version) === -1;
	}

	lte(version: Semver): boolean {
		return this.compare(version) !== 1;
	}

	toString() {
		return `Semver(${this.major},${this.minor},${this.patch})`;
	}
}
