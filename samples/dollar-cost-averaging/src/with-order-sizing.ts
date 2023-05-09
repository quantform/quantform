import { map } from 'rxjs';

import { useBinance } from '@quantform/binance';
import { Instrument } from '@quantform/core';

export function withOrderSizing(instrument: Instrument) {
  const { withBalance } = useBinance();

  return withBalance(instrument.quote).pipe(map(it => it.free));
}
