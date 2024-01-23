import { Dependency, withRequest } from '@quantform/core';

import { withSimulator } from './api/simulator';
import { useCredentials } from './api/use-credentials';
import { whenSocket } from './api/when-socket';
import { withSignedRequest } from './api/with-signed-request';
import { useLogger } from './use-logger';
import { BinanceOptions, options, useOptions } from './use-options';
import { whenBalance } from './when-balance';
import { whenBalances } from './when-balances';
import { whenOrder } from './when-order';
import { whenOrderbookDepth } from './when-orderbook-depth';
import { whenOrderbookTicker } from './when-orderbook-ticker';
import { whenTrade } from './when-trade';
import { withAsset } from './with-asset';
import { withAssets } from './with-assets';
import { withBalance } from './with-balance';
import { withBalances } from './with-balances';
import { withCommission } from './with-commission';
import { withInstrument } from './with-instrument';
import { withInstruments } from './with-instruments';
import { withOrderCancel } from './with-order-cancel';
import { withOrderNew } from './with-order-new';
import { withOrders } from './with-orders';

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
  whenSocket,
  withAsset,
  withAssets,
  withBalance,
  withBalances,
  withCommission,
  withInstrument,
  withInstruments,
  withOrderCancel,
  withOrderNew,
  withOrders,
  withRequest,
  withSignedRequest,
  withSimulator
});
