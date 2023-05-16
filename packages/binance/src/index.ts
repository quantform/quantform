import { Dependency } from '@quantform/core';

import { withAsset, withAssets } from './asset';
import { whenBalance, whenBalances, withBalance, withBalances } from './balance';
import { withCommission } from './commission';
import { withExchangeInfo, withInstrument, withInstruments } from './instrument';
import { whenOrder, withOrderCancel, withOrderNew, withOrders } from './order';
import { whenOrderbookDepth, whenOrderbookTicker } from './orderbook';
import { whenTrade } from './trade';
import { useCredentials } from './use-credentials';
import { useLogger } from './use-logger';
import { BinanceOptions, options, useOptions } from './use-options';
import {
  whenUserAccount,
  withUserAccount,
  withUserListenKey,
  withUserListenKeyKeepAlive
} from './user';
import { whenSocket } from './when-socket';
import { withRequest } from './with-request';
import { withSignedRequest } from './with-signed-request';
import { withSimulatorOptions } from './with-simulator-options';

export function binance(opts: Partial<BinanceOptions>): Dependency[] {
  return [options(opts)];
}

export const useBinance = () => ({
  name: 'binance' as const,
  useCredentials,
  useLogger,
  useOptions,
  whenBalance,
  whenBalances,
  whenOrder,
  whenOrderbookDepth,
  whenOrderbookTicker,
  whenTrade,
  whenUserAccount,
  whenSocket,
  withAsset,
  withAssets,
  withBalance,
  withBalances,
  withCommission,
  withExchangeInfo,
  withInstrument,
  withInstruments,
  withOrderCancel,
  withOrderNew,
  withOrders,
  withUserAccount,
  withUserListenKey,
  withUserListenKeyKeepAlive,
  withRequest,
  withSignedRequest,
  withSimulatorOptions
});
