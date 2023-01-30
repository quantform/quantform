import { log, provider, useProvider } from '@quantform/core';

@provider()
export class BinanceOptions {
  apiKey?: string;
  apiSecret?: string;
  logger = log('Binance');
}

export function useBinanceOptions() {
  return useProvider(BinanceOptions);
}
