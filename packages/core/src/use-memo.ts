import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

import { useProvider } from '@lib/module';
import { useHash } from '@lib/use-hash';

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

export function memo<T>(dependencies: unknown[]) {
  return useMemo(() => (observable: Observable<T>) => observable, dependencies);
}
