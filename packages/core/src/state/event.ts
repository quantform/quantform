export interface Event<T extends string = `${string}://${string}`> {
  type: T;
}

export function event<T extends `${string}://${string}`>(type: T) {
  return function <P>() {
    return (payload: P) => ({ type, ...payload } as { type: T } & P);
  };
}
