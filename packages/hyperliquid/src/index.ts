import { Dependency } from '@quantform/core';

import { getAllMids } from './get-all-mids';
import { getUser } from './perpetual/get-user';
import { usePerpetual } from './perpetual/use-perpetual';
import { useLogger } from './use-logger';
import { HyperliquidOptions, options, useOptions } from './use-options';
import { useRequest } from './use-request';
import { useSocket } from './use-socket';
import { useSocketSubscription } from './use-socket-subscription';
import { watchAllMids } from './watch-all-mids';
import { watchCandle } from './watch-candle';
import { watchNotifications } from './watch-notifications';
import { watchOrderUpdates } from './watch-order-updates';
import { watchOrderbook } from './watch-orderbook';
import { watchTrades } from './watch-trades';
import { watchWeb2Data } from './watch-web2-data';

export { HyperliquidOptions } from './use-options';

export function hyperliquid(opts: Partial<HyperliquidOptions>): Dependency[] {
  return [options(opts)];
}

export const useHyperliquid = () => ({
  name: 'hyperliquid' as const,
  useLogger,
  useOptions,
  useRequest,
  useSocket,
  useSocketSubscription,
  usePerpetual,
  getAllMids,
  getUser,
  watchAllMids,
  watchCandle,
  watchNotifications,
  watchOrderUpdates,
  watchOrderbook,
  watchTrades,
  watchWeb2Data
});
