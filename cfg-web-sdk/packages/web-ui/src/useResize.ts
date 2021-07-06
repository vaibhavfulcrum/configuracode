import { useCallback, useEffect, useState } from "react";

interface Size {
	width: number;
	height: number;
}

function getSize(element?: Element): Size {
	let { innerWidth, innerHeight } = window;

	if (element) {
		const rect = element.getBoundingClientRect();
		innerHeight = rect.height;
		innerWidth = rect.width;
	}

	return { width: innerWidth, height: innerHeight };
}

export function useResize(element?: Element): [Size, () => void] {
	const [size, setSize] = useState(() => getSize(element));

	const refresh = useCallback(() => {
		const current = getSize(element);
		if (current.height === size.height && current.width === size.width) {
			return;
		}
		setSize(current);
	}, [element, size.height, size.width]);

	useEffect(refresh, [element]);

	useEffect(() => {
		window.addEventListener("resize", refresh);
		return () => {
			window.removeEventListener("resize", refresh);
		};
	}, [refresh]);

	return [size, refresh];
}
