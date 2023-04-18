import { Dependency } from '@quantform/core';

import { useBinanceAsset, useBinanceAssets } from './asset';
import { useBinanceBalance, useBinanceBalances } from './balance';
import { useBinanceCommission } from './commission';
import { useBinanceInstrument, useBinanceInstruments } from './instrument';
import { useBinanceOrder, useBinanceOrders } from './order';
import { useBinanceOrderbookDepth, useBinanceOrderbookTicker } from './orderbook';
import { useBinanceTrade } from './trade';
import { BinanceOptions, options, useBinanceOptions } from './use-binance-options';

export function binance(opts: Partial<BinanceOptions>): Dependency[] {
  return [options(opts)];
}

export {
  useBinanceAsset,
  useBinanceAssets,
  useBinanceBalance,
  useBinanceBalances,
  useBinanceCommission,
  useBinanceInstrument,
  useBinanceInstruments,
  useBinanceOrder,
  useBinanceOrders,
  useBinanceOrderbookDepth,
  useBinanceOrderbookTicker,
  useBinanceTrade,
  useBinanceOptions
};
