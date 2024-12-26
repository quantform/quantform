import { useMemo } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

export function watchAllMids() {
  return useMemo(
    () => useSocketSubscription({ type: 'allMids' }),
    ['hyperliquid', 'watch-all-mids']
  );
}
