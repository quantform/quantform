import { log, provider, useProvider } from '@quantform/core';

@provider()
export class BinanceOptions {
  apiKey = process.env.BINANCE_API_KEY;
  apiSecret = process.env.BINANCE_API_SECRET;
  apiUrl = 'https://api.binance.com';
  recvWindow = 5000;
  logger = log('Binance');
}

export function useBinanceOptions() {
  return useProvider(BinanceOptions);
}
