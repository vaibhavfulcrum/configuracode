import { CfgOption } from "@configura/web-api";
import { useEffect, useState } from "react";

export function useSelected(option: CfgOption) {
	const [selected, setSelected] = useState(option.selected);

	useEffect(() => {
		setSelected(option.selected);
	}, [option]);

	useEffect(() => {
		const listener = () => setSelected(option.selected);
		option.listenForChange(listener);
		return () => option.stopListenForChange(listener);
	}, [option]);

	return selected;
}
