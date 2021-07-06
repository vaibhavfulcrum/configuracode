export function getWaitFramesPromise(frameCount: number) {
	return new Promise((resolve) => {
		const frame = () => {
			if (frameCount === 0) {
				resolve();
			}
			frameCount--;
			requestAnimationFrame(frame);
		};
		frame();
	});
}
