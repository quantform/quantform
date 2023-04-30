import { map } from 'rxjs';

import { useBinanceBalance } from '@quantform/binance';
import { Instrument } from '@quantform/core';

export function useOrderSizing(instrument: Instrument) {
  return useBinanceBalance(instrument.quote).pipe(map(it => it.free));
}
