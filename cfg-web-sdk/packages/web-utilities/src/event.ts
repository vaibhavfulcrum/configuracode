export type EventListener<T, K extends keyof T> = (v: T[K]) => void;
