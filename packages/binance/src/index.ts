import { Dependency } from '@quantform/core';

import { useAsset as useBinanceAsset, useAssets as useBinanceAssets } from './asset';
import {
  useBalance as useBinanceBalance,
  useBalances as useBinanceBalances
} from './balance';
import { useCommission as useBinanceCommission } from './commission';
import {
  useInstrument as useBinanceInstrument,
  useInstruments as useBinanceInstruments
} from './instrument';
import { useOrder as useBinanceOrder, useOrders as useBinanceOrders } from './order';
import {
  useOrderbookDepth as useBinanceOrderbookDepth,
  useOrderbookTicker as useBinanceOrderbookTicker
} from './orderbook';
import { useTrade as useBinanceTrade } from './trade';
import { BinanceOptions, options, useOptions as useBinanceOptions } from './use-options';

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
