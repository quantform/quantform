import { join } from 'path';
import { map } from 'rxjs';

import { useSocket, useTimestamp } from '@quantform/core';

export function useBinanceSocket(patch: string) {
  return useSocket(join('wss://stream.binance.com:9443', patch)).pipe(
    map(payload => ({ timestamp: useTimestamp(), payload }))
  );
}
