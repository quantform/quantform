import { join } from 'path';
import { map } from 'rxjs';
import { ZodType } from 'zod';

import { connected, disconnected, useSocket, useTimestamp } from '@quantform/core';

import { useBinanceLogger } from './use-logger';
import { useOptions } from './use-options';

export function useReadonlySocket<T extends ZodType>(messageType: T, patch: string) {
  const { debug } = useBinanceLogger();
  const { wsUrl } = useOptions();
  const [message] = useSocket<T>(messageType, join(wsUrl, patch));

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
