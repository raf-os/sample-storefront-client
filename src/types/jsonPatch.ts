export type PathImpl<T, Key extends keyof T> = 
  Key extends string
    ? T[Key] extends string | number | boolean | Array<any> | null
      ? `/${Key}`
      : `/${Key}` | `/${Key}${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}`
    : never;

export type Path<T> = PathImpl<T, keyof T> | '/';

export type PathValue<T, P extends string> = 
  P extends `/${infer Key}/${infer Rest}`
    ? Key extends keyof T
      ? PathValue<T[Key], `/${Rest}`>
      : never
    : P extends `/${infer Key}`
      ? Key extends keyof T
        ? T[Key]
        : never
      : T;

export type PatchOperation<T> = 
  | { op: 'replace'; path: Path<T>; value: PathValue<T, Path<T>> }
  | { op: 'add'; path: Path<T> | `${Path<T>}/-`; value: any }
  | { op: 'remove'; path: Path<T> }
  | { op: 'copy'; from: Path<T>; path: Path<T> }
  | { op: 'move'; from: Path<T>; path: Path<T> }
  | { op: 'test'; path: Path<T>; value: PathValue<T, Path<T>> };

export type PatchDocument<T> = PatchOperation<T>[];