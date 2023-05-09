import { Dependency } from '@quantform/core';

import { withAsset, withAssets } from './asset';
import { whenBalance, whenBalances, withBalance, withBalances } from './balance';
import { withCommission } from './commission';
import { withExchangeInfo, withInstrument, withInstruments } from './instrument';
import { BinanceOptions, options } from './use-options';
import {
  whenUserAccount,
  withUserAccount,
  withUserListenKey,
  withUserListenKeyKeepAlive
} from './user';

export function binance(opts: Partial<BinanceOptions>): Dependency[] {
  return [options(opts)];
}

export const useBinance = () => ({
  withAsset,
  withAssets,

  whenBalance,
  whenBalances,
  withBalance,
  withBalances,

  withCommission,

  withExchangeInfo,
  withInstrument,
  withInstruments,

  whenUserAccount,
  withUserAccount,
  withUserListenKey,
  withUserListenKeyKeepAlive
});
