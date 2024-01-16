import { Commission, decimal, provider, useContext } from '@quantform/core';

@provider()
export class BinanceOptions {
  apiKey = process.env.BINANCE_API_KEY;
  apiSecret = process.env.BINANCE_API_SECRET;
  apiUrl = 'https://api.binance.com';
  wsUrl = 'wss://stream.binance.com:9443';
  recvWindow = 5000;

  simulator?: {
    balance: Record<string, { free: decimal }>;
    commission: Commission;
  };
}

export function options(options: Partial<BinanceOptions>) {
  return {
    provide: BinanceOptions,
    useValue: { ...new BinanceOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(BinanceOptions);
}
