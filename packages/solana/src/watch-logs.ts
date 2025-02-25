import { map } from 'rxjs';

import { useMemo, useReplay } from '@quantform/core';

import { Commitment } from './commitment';
import { useSocketSubscription } from './use-socket-subscription';

export function watchLogs(address: string, commitment: Commitment) {
  const key = ['solana', 'watch-logs', address, commitment];

  return useMemo(
    () =>
      useReplay(
        useSocketSubscription<{
          signature: string;
          err: unknown;
          logs: Array<string>;
        }>(commitment, {
          method: 'logsSubscribe',
          params: [{ mentions: [address] }, { commitment }]
        }),
        key
      ),
    key
  );
}
