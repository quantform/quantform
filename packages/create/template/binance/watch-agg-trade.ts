import { useReplay } from '@quantform/core';

import { watchAggTradeLive } from './watch-agg-trade.live';
import { watchAggTradeReplay } from './watch-agg-trade.replay';

export function watchAggTrade(symbol: string) {
  return useReplay(watchAggTradeReplay, watchAggTradeLive)(symbol);
}
