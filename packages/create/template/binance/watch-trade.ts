import { map } from 'rxjs';

import { useReplay } from '@quantform/core';

import { watchTradeLive } from './watch-trade.live';
import { watchTradeReplay } from './watch-trade.replay';

export function watchTrade(symbol: string) {
  return useReplay(
    watchTradeReplay,
    watchTradeLive
  )(symbol).pipe(map(it => it.payload.price));
}
