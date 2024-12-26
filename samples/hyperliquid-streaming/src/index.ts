import { switchMap, tap } from 'rxjs';

import { behavior, instrumentOf, strategy, useLogger } from '@quantform/core';
import { hyperliquid, HyperliquidOptions, useHyperliquid } from '@quantform/hyperliquid';

export default strategy(() => {
  behavior(() => {
    const { info } = useLogger('streaming');
    const { usePerpetual, watchTrades, watchUsers, watchOrderbook } = useHyperliquid();
    const { getInstrument, getUser } = usePerpetual();

    return watchUsers().pipe(tap(it => info(JSON.stringify(it))));

    const user = getUser('0x4abe3b86162023c8d5e57b9494525c3ebf06b1d3');

    //return user.pipe(tap(it => info(JSON.stringify(it))));

    return getInstrument(instrumentOf('hyperliquid:btc-usdc')).pipe(
      switchMap(instrument => watchOrderbook(instrument)),
      tap(it => info(JSON.stringify({ bid: it.bids[0], ask: it.asks[0] })))
    );
  });

  return [...hyperliquid(HyperliquidOptions.mainnet())];
});
