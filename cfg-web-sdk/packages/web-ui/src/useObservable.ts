import { Observable } from "@configura/web-utilities";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useObservableWithCallback<T>(
	o: Observable<T> | undefined | null | false,
	callback: ((x: T) => void) | undefined
): void {
	useEffect(() => {
		if (o === undefined || o === null || o === false || callback === undefined) {
			return;
		}

		o.listen(callback);

		return () => {
			o.stopListen(callback);
		};
	}, [o, callback]);
}

export function useObservableState<T>(
	o: Observable<T> | undefined,
	initValue: T
): [T, Dispatch<SetStateAction<T>>] {
	const state = useState<T>(initValue);
	const [, set] = state;
	useObservableWithCallback(o, set);
	return state;
}
