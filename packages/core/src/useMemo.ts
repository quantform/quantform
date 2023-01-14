import { randomUUID } from 'crypto';

import { useProvider } from '@lib/module';
import { useHash } from '@lib/useHash';

export const MemoToken = Symbol('memo-token');

export function provideMemo() {
  return {
    provide: MemoToken,
    useValue: {}
  };
}

export function useMemo<T>(calculateValue: () => T, dependencies: unknown[]) {
  const memory = useProvider<Record<string, any>>(MemoToken);
  const hash = useHash(dependencies);

  if (memory[hash]) {
    return memory[hash] as T;
  }

  return (memory[hash] = calculateValue()) as T;
}

export const withMemo = <T>(calculateValue: () => T) => {
  const uuid = randomUUID();

  return () => useMemo(calculateValue, [withMemo.name, uuid]);
};
