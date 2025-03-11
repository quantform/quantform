import { useMemo, useSocket as useCoreSocket } from '@quantform/core';

import { Commitment } from './commitment';
import { useOptions } from './use-options';

export function useSocket(commitment: Commitment) {
  return useMemo(() => {
    const { wss } = useOptions();

    return useCoreSocket(wss.url);
  }, ['solana', 'use-socket', commitment]);
}
