import { useContext } from '@lib/module';
import { dependency, useHash } from '@lib/use-hash';

export const token = Symbol('memo-token');

/**
 *
 */
export function memo() {
  return {
    provide: token,
    useValue: {}
  };
}

/**
 * @name useMemo
 * @description
 * A hook that caches the result of an expensive calculation, based on a set of dependencies.
 *
 * @template T The type of the value that is memoized.
 * @param {() => T} calculateValue A function that returns the value to memoize.
 * @param {dependency[]} dependencies An array of dependencies that determine when the value should be recalculated.
 * @returns {T} The memoized value.
 */
export function useMemo<T>(calculateValue: () => T, dependencies: dependency[]) {
  const memory = useContext<Record<string, any>>(token);
  const hash = useHash(dependencies);

  if (memory[hash]) {
    return memory[hash] as T;
  }

  return (memory[hash] = calculateValue()) as T;
}
