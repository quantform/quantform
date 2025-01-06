import { map } from 'rxjs';
import { z } from 'zod';

import { useMemo, useReplay } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  mids: z.record(z.string(), z.string())
});

export function watchAllMids() {
  const key = hash();

  return useMemo(
    () =>
      useReplay(useSocketSubscription({ type: 'allMids' }), key).pipe(
        map(it => payloadType.parse(it.payload))
      ),
    key
  );
}

export function hash() {
  return ['hyperliquid', 'watch-all-mids'];
}
