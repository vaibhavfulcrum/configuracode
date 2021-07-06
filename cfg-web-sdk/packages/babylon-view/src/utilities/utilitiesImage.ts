import { Color, ColorType } from "@configura/web-core/dist/cm/basic/Color";

export function aggregateImage<T>(
	image: HTMLImageElement,
	aggregator: (imgData: ImageData) => T
): T | undefined {
	const canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	const context = canvas.getContext("2d");
	if (context !== null) {
		context.drawImage(image, 0, 0);

		const imgData = context.getImageData(0, 0, image.width, image.height);

		return aggregator(imgData);
	}

	return;
}

const CC = 4; // All imageDatas will be 4 channel (RGBA)

export function calculateLightnessFromImage(image: HTMLImageElement): number | undefined {
	return aggregateImage(image, (imgData: ImageData) => {
		let t = 0;
		const data = imgData.data;
		const size = data.length;
		for (let i = 0; i < size; i += CC) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			t += Math.max(r, g, b) + Math.min(r, g, b);
		}
		const average = (2 * t) / (size * 255);
		return average;
	});
}

export function allPixelsAreColor(image: HTMLImageElement): false | Color {
	return (
		aggregateImage(image, (imgData: ImageData) => {
			const data = imgData.data;
			const size = data.length;
			if (size === 0) {
				return false;
			}
			for (let i = 0; i < size; i++) {
				if (i < CC) {
					continue;
				}
				if (data[i] !== data[i % CC]) {
					return false;
				}
			}
			return new Color(ColorType.rgbaColor, data[0], data[1], data[2], data[3]);
		}) || false
	);
}

export function isLikelyBumpMap(
	image: HTMLImageElement,
	acceptableDeviationFromGray: number = 0
): boolean {
	const isAcceptableDeviation = (c1: number, c2: number): boolean => {
		const pxAcceptableDeviation = acceptableDeviationFromGray * 255;
		return Math.abs(c1 - c2) < pxAcceptableDeviation;
	};
	return (
		aggregateImage(image, (imgData: ImageData) => {
			const data = imgData.data;
			const size = data.length;
			const variationsInChannels = [false, false, false];
			for (let i = 0; i < size; i += CC) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				if (
					isAcceptableDeviation(r, g) &&
					isAcceptableDeviation(g, b) &&
					isAcceptableDeviation(b, r)
				) {
					continue;
				}
				if (i === 0) {
					continue;
				}
				let variedChannelsCount = 0;
				for (let j = 0; j < CC - 1; j++) {
					if (data[i + j] !== data[j]) {
						variationsInChannels[j] = true;
					}
					if (variationsInChannels[j]) {
						variedChannelsCount++;
					}
				}
				if (1 < variedChannelsCount) {
					return false;
				}
			}
			return true;
		}) || false
	);
}

export function isLikelyNormalMap(image: HTMLImageElement): boolean {
	// A normal map represents the local surface inclination (direction, slope) relative
	// to the texture. In every pixel the values RGB represent the three base vectors XYZ.
	// A complete flat surface will have all normals pointing straight out of the texture,
	// in the Z-direction. This is the blue component. Therefore a normal map will normally
	// look blueish. We here test that we have a certain amount more of blue than the other
	// components to see if the is likely a normal-map.
	const blueMoreThanRedAndGreenThreshold = 1.2;

	return (
		aggregateImage(image, (imgData: ImageData) => {
			const data = imgData.data;
			const size = data.length;
			const channelSum = [0, 0, 0];

			for (let i = 0; i < size; i++) {
				const comp = i % CC;
				if (comp === 3) {
					continue;
				}
				channelSum[comp] += data[i];
			}

			const [r, g, b] = channelSum;
			return (
				blueMoreThanRedAndGreenThreshold < b / r && blueMoreThanRedAndGreenThreshold < b / g
			);
		}) || false
	);
}
