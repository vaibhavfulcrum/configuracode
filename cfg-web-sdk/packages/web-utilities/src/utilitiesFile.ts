export type BufferWithFileName = { buffer: ArrayBuffer; fileName: string };

export async function readFileToArrayBuffer(fileReference: File): Promise<BufferWithFileName> {
	return new Promise<BufferWithFileName>((resolve, reject) => {
		const reader = new FileReader();

		reader.addEventListener("load", (e: ProgressEvent<FileReader>) => {
			const target = e.target;
			if (target === null) {
				reject(new Error("No target"));
				return;
			}
			const result = target.result;
			if (!(result instanceof ArrayBuffer)) {
				reject(new Error("No ArrayBuffer"));
				return;
			}

			resolve({ buffer: result, fileName: fileReference.name });
		});

		reader.readAsArrayBuffer(fileReference);
	});
}

export function getFileExtension(filename: string) {
	return filename.slice(filename.lastIndexOf(".") + 1);
}
