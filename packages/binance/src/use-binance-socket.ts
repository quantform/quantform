import { join } from 'path';

import { useSocket } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';

export function useBinanceSocket(patch: string) {
  const { wsUrl } = useBinanceOptions();
  const [message] = useSocket(join(wsUrl, patch));

  return message;
}
