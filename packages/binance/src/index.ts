import { Dependency, withRequest } from '@quantform/core';

import { withSimulator } from './api/simulator';
import { useCredentials } from './api/use-credentials';
import { whenSocket } from './api/when-socket';
import { withSignedRequest } from './api/with-signed-request';
import { getAsset } from './asset/get-asset';
import { getAssets } from './asset/get-assets';
import { getBalance } from './balance/get-balance';
import { getBalances } from './balance/get-balances';
import { watchBalance } from './balance/watch-balance';
import { watchBalances } from './balance/watch-balances';
import { getCommission } from './instrument/get-commission';
import { getInstrument } from './instrument/get-instrument';
import { getInstruments } from './instrument/get-instruments';
import { cancelOrder } from './order/cancel-order';
import { createOrder } from './order/create-order';
import { getOrders } from './order/get-orders';
import { watchOrders } from './order/watch-orders';
import { watchOrderbookDepth } from './orderbook/watch-orderbook-depth';
import { watchOrderbookTicker } from './orderbook/watch-orderbook-ticker';
import { watchTrade } from './trade/watch-trade';
import { useLogger } from './use-logger';
import { BinanceOptions, options, useOptions } from './use-options';

export function binance(opts: Partial<BinanceOptions>): Dependency[] {
  return [options(opts)];
}

export const useBinance = () => ({
  name: 'binance' as const,
  useCredentials,
  useLogger,
  useOptions,
  watchBalance,
  watchBalances,
  watchOrders,
  watchOrderbookDepth,
  watchOrderbookTicker,
  watchTrade,
  whenSocket,
  getAsset,
  getAssets,
  getBalance,
  getBalances,
  getCommission,
  getInstrument,
  getInstruments,
  cancelOrder,
  createOrder,
  getOrders,
  withRequest,
  withSignedRequest,
  withSimulator
});
