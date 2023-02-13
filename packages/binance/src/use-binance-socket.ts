import { join } from 'path';
import { map } from 'rxjs';

import { useSocket, useTimestamp } from '@quantform/core';

export function useBinanceSocket<T>(patch: string) {
  const [message] = useSocket(join('wss://stream.binance.com:9443', patch));

  return message.pipe(
    map(payload => ({ timestamp: useTimestamp(), payload: payload as T }))
  );
}
