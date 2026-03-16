import { map } from 'rxjs';
import { z } from 'zod';

import { useCache, useReplaySync } from '@quantform/core';

import { useRequest } from './use-request';

export const responseType = z.record(z.string(), z.string());

export function getAllMids() {
  return useReplaySync(
    useCache(
      useRequest({ patch: '/info', body: { type: 'allMids' } }).pipe(
        map(it => responseType.parse(it.payload))
      ),
      ['hyperliquid', 'get-all-mids']
    )
  );
}
