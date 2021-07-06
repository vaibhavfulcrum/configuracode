import { useMemo } from "react";

export function useMemoized<T, V>(func: (value: V) => T, value: V): T {
	return useMemo(() => func(value), [func, value]);
}

export function useMemoized2<T, V, U>(func: (first: V, second: U) => T, first: V, second: U): T {
	return useMemo(() => func(first, second), [func, first, second]);
}
