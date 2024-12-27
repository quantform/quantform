import { switchMap, tap } from 'rxjs';

import { behavior, instrumentOf, strategy, useLogger } from '@quantform/core';
import { hyperliquid, HyperliquidOptions, useHyperliquid } from '@quantform/hyperliquid';

function trade() {
  const { info } = useLogger('streaming');
  const { usePerpetual, watchTrades, watchOrderbook } = useHyperliquid();
  const { getInstrument, getUser } = usePerpetual();

  const user = getUser('0x4abe3b86162023c8d5e57b9494525c3ebf06b1d3');

  //return user.pipe(tap(it => info(JSON.stringify(it))));

  return getInstrument(instrumentOf('hyperliquid:btc-usdc')).pipe(
    switchMap(instrument => watchTrades(instrument)),
    tap(it => info(JSON.stringify(it)))
  );
}

export default strategy(() => {
  behavior(() => trade());

  return [...hyperliquid(HyperliquidOptions.mainnet())];
});
