import { v4 } from 'uuid';

import { throwWithContext } from './module';
import { dependency } from './use-hash';
import { useMemo } from './use-memo';

export const withMemo = <T extends Array<dependency>, U>(fn: (...args: T) => U) => {
  throwWithContext();

  const uniqueId = v4();

  return (...args: T): U => useMemo(() => fn(...args), [uniqueId, ...args]);
};
