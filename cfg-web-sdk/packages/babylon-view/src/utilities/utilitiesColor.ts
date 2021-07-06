import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color } from "@configura/web-core/dist/cm/basic/Color";
import { ColorF } from "@configura/web-core/dist/cm/basic/ColorF";

/**
 * Converts a number of different color formats into Color3 for use with Babylon.js
 * Returns White if object is undefined.
 */
export function toColor3(object: Color3 | ColorF | Color | string | number | undefined): Color3 {
	if (object === undefined) {
		return Color3.White();
	}
	if (typeof object === "number") {
		// Assume object is a 24 bit integer
		return Color3.FromInts((object >>> 16) & 0xff, (object >>> 8) & 0xff, object & 0xff);
	}
	if (typeof object === "string") {
		// Assume object is a hex-string
		return Color3.FromHexString(object);
	}
	if (object instanceof ColorF) {
		// Object is a DEX ColorF (floats, 0-1)
		return new Color3(object.r, object.g, object.b);
	}
	if (object instanceof Color) {
		// Object is a DEX Color (integers 0-255)
		return Color3.FromInts(object.r, object.g, object.b);
	}
	// Must be Color3 already
	return object;
}

/**
 * in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
 * Original source: https://stackoverflow.com/a/54071699/1488048
 */
export function rgb2hsl(r: number, g: number, b: number) {
	let a = Math.max(r, g, b),
		n = a - Math.min(r, g, b),
		f = 1 - Math.abs(a + a - n - 1);
	let h = n && (a === r ? (g - b) / n : a === g ? 2 + (b - r) / n : 4 + (r - g) / n);
	return [60 * (h < 0 ? h + 6 : h), f ? n / f : 0, (a + a - n) / 2];
}

/**
 * input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
 * Original source: https://stackoverflow.com/a/54014428/1488048
 */
export function hsl2rgb(h: number, s: number, l: number) {
	let a: number = s * Math.min(l, 1 - l);
	let f = (n: number, k: number = (n + h / 30) % 12) =>
		l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	return [f(0), f(8), f(4)];
}
