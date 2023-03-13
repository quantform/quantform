import { join } from 'path';
import { map } from 'rxjs';
import { ZodType } from 'zod';

import {
  connectionClosed,
  connectionOpened,
  filterLifecycle,
  useSocket,
  useTimestamp
} from '@quantform/core';

import { useBinanceLogger } from './use-binance-logger';

export function useBinanceSocket<T extends ZodType>(schema: T, patch: string) {
  const { debug } = useBinanceLogger();
  const [message] = useSocket<T>(schema, join('wss://stream.binance.com:9443', patch));

  return message.pipe(
    map(payload => {
      if (payload === connectionOpened) {
        debug('ws connection opened', patch);

        return payload;
      }

      if (payload === connectionClosed) {
        debug('ws connection closed', patch);

        return payload;
      }

      return { timestamp: useTimestamp(), payload };
    }),
    filterLifecycle()
  );
}
