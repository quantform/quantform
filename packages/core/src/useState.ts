import { useMemo } from '@lib/useMemo';

export function useState<T>(
  initialValue: T,
  dependencies: unknown[]
): [T, (value: T) => void] {
  return useMemo(() => {
    let state = initialValue;

    const setState = (newState: T) => {
      state = newState;
    };

    return [state, setState];
  }, dependencies);
}
