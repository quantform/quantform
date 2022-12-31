import { BinanceConnector } from './binance-connector';

export * from '@lib/binance-adapter';

export class BinanceModule {
  imports: [BinanceAdapter, BinanceConnector];
}
