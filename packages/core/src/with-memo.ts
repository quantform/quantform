import { v4 } from 'uuid';

import { useMemo } from './use-memo';

export const withMemo = <T extends Array<any>, U>(fn: (...args: T) => U) => {
  const uniqueId = v4();

  return (...args: T): U => useMemo(() => fn(...args), [uniqueId, ...args]);
};
