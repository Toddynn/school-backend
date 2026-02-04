export type DeepValueOf<T> = T extends object ? { [K in keyof T]: DeepValueOf<T[K]> } : T;
