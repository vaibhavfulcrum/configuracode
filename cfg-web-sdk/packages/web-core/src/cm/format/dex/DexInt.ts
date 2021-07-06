export class DexInt {
	constructor(public value: number) {}

	toString() {
		return `DexInt(${this.value})`;
	}
}

// TODO: is this correct at all?
export class DexInt64 {
	constructor(private high: number, private low: number) {}

	toString() {
		return `DexInt(${this.high}, ${this.low})`;
	}
}
