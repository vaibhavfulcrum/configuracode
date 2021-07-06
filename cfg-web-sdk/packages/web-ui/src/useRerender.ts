import { useCallback, useState } from "react";

export function useRerender() {
	const [, updateState] = useState({});
	return useCallback(() => updateState({}), []);
}
