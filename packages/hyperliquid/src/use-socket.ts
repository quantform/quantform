import { useMemo, useSocket as useCoreSocket } from '@quantform/core';

import { useOptions } from './use-options';

export function useSocket() {
  return useMemo(() => {
    const { wss } = useOptions();

    return useCoreSocket(wss.url);
  }, ['hyperliquid', 'use-socket']);
}
