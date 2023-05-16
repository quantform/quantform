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

export function useMemo<T>(calculateValue: () => T, dependencies: dependency[]) {
  const memory = useContext<Record<string, any>>(token);
  const hash = useHash(dependencies);

  if (memory[hash]) {
    return memory[hash] as T;
  }

  return (memory[hash] = calculateValue()) as T;
}
