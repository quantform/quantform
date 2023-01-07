function memo() {
  const memory: Record<string, unknown> = {};

  return <T>(calculateValue: () => T, dependencies: unknown[]): T => {
    const hash = [calculateValue.name, dependencies].join('/');

    if (memory[hash]) {
      return memory[hash] as T;
    }
    return (memory[hash] = calculateValue()) as T;
  };
}

export const useMemo = memo();

export const withMemo =
  <T>(calculateValue: () => T, dependencies: unknown[]) =>
  () =>
    useMemo(calculateValue, dependencies);
