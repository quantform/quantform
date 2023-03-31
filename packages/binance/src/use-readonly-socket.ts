import { join } from 'path';
import { map, Observable } from 'rxjs';
import { z, ZodType } from 'zod';

import {
  disconnected,
  connected,
  filterLifecycle,
  useSocket,
  useTimestamp
} from '@quantform/core';

import { useBinanceLogger } from './use-logger';

export function useReadonlySocket<T extends ZodType>(
  schema: T,
  patch: string
): Observable<{ timestamp: number; payload: z.infer<typeof schema> }> {
  const { debug } = useBinanceLogger();
  const [message] = useSocket<T>(schema, join('wss://stream.binance.com:9443', patch));

  return message.pipe(
    map(payload => {
      if (payload === connected) {
        debug('ws connection opened', patch);

        return payload;
      }

      if (payload === disconnected) {
        debug('ws connection closed', patch);

        return payload;
      }

      return { timestamp: useTimestamp(), payload };
    }),
    filterLifecycle()
  );
}
