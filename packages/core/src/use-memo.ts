import { useContext } from '@lib/module';
import { useHash } from '@lib/use-hash';

export const token = Symbol('memo-token');

/**
 *
 */
export function MemoModule() {
  return {
    provide: token,
    useValue: {}
  };
}

/**
 *
 * @param calculateValue
 * @param dependencies
 */
export function useMemo<T>(calculateValue: () => T, dependencies: unknown[]) {
  const memory = useContext<Record<string, any>>(token);
  const hash = useHash(dependencies);

  if (memory[hash]) {
    return memory[hash] as T;
  }

  return (memory[hash] = calculateValue()) as T;
}
