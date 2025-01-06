import { map } from 'rxjs';
import { z } from 'zod';

import { useCache, useReplayLock } from '@quantform/core';

import { useRequest } from './use-request';

export const responseType = z.record(z.string(), z.string());

export function getAllMids() {
  return useReplayLock(
    useCache(
      useRequest({ patch: '/info', body: { type: 'allMids' } }).pipe(
        map(it => responseType.parse(it.payload))
      ),
      ['hyperliquid', 'get-all-mids']
    )
  );
}
