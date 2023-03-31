import { join } from 'path';
import { map } from 'rxjs';
import { ZodType } from 'zod';

import { connected, disconnected, useSocket, useTimestamp } from '@quantform/core';

import { useBinanceLogger } from './use-logger';

export function useReadonlySocket<T extends ZodType>(schema: T, patch: string) {
  const { debug } = useBinanceLogger();
  const [message] = useSocket<T>(schema, join('wss://stream.binance.com:9443', patch));

  return message.pipe(
    map(payload => {
      switch (payload) {
        case connected:
          debug('ws connection opened', patch);
          return connected;

        case disconnected:
          debug('ws connection closed', patch);
          return disconnected;
      }

      return { timestamp: useTimestamp(), payload };
    })
  );
}
