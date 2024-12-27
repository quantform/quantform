import { map } from 'rxjs';
import { z } from 'zod';

import { useMemo, useReplay } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  // TODO: add schema
});

export function watchWeb2Data(user: string) {
  const key = discriminator(user);

  return useMemo(
    () =>
      useReplay(useSocketSubscription({ type: 'WebData2', user }), key).pipe(
        map(it => payloadType.parse(it.payload))
      ),
    key
  );
}

export function discriminator(user: string) {
  return ['hyperliquid', 'watch-web2-data', user];
}
