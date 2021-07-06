export async function loadImage(url: string): Promise<HTMLImageElement | undefined> {
	return new Promise<HTMLImageElement | undefined>(
		(resolve: (img: HTMLImageElement | undefined) => void, reject: (reason?: any) => void) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(Error(`Failed to load image ${url}`));
			image.src = url;
		}
	);
}
