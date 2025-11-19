export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Flatten<T> = T extends (infer U)[] ? U : T;