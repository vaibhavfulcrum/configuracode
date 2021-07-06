import { useMemo } from "react";
import v4 from "uuid/v4";

export const useUuid = () => {
	return useMemo(() => {
		return `${v4()}`;
	}, []);
};
