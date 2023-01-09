import { randomUUID } from 'crypto';

function memo() {
  const memory: Record<string, unknown> = {};

  return <T>(calculateValue: () => T, dependencies: unknown[]): T => {
    const hash = [memo.name, calculateValue.name, dependencies].join('/');

    if (memory[hash]) {
      return memory[hash] as T;
    }
    return (memory[hash] = calculateValue()) as T;
  };
}

export const useMemo = memo();

export const withMemo = <T>(calculateValue: () => T) => {
  const uuid = randomUUID();

  return () => useMemo(calculateValue, [withMemo.name, uuid]);
};
