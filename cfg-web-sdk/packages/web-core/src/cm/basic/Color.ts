export enum ColorType {
	noColor = 0,
	bgColor = 1,
	rgbColor = 2,
	rgbaColor = 3,
}

export class Color {
	static BLACK = new Color(ColorType.rgbColor, 0, 0, 0);
	static WHITE = new Color(ColorType.rgbColor, 255, 255, 255);
	constructor(public type: ColorType, public r = 0, public g = 0, public b = 0, public a = 0) {}
}
