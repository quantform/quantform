import { join } from 'path';
import { map } from 'rxjs';

import { useSocket, useTimestamp } from '@quantform/core';

export function useBinanceSocket<T>(patch: string) {
  const [message] = useSocket(join('wss://stream.binance.com:9443', patch));
  const { timestamp } = useTimestamp();

  return message.pipe(
    map(payload => ({ timestamp: timestamp(), payload: payload as T }))
  );
}
