import { log, provider } from '@quantform/core';

@provider()
export class BinanceOptions {
  apiKey?: string;
  apiSecret?: string;
  logger = log('Binance');
}
