import { defer, of, tap } from 'rxjs';

import { useBinanceOrderOpenRequest } from '@quantform/binance';
import { decimal, Instrument } from '@quantform/core';

export function useExecutor(instrument: Instrument, quantity: decimal) {
  return defer(() =>
    /*useBinanceOrderOpenRequest({
      instrument,
      quantity,
      type: 'MARKET',
      timeInForce: 'GTC'
    })*/
    of(true).pipe(tap(it => console.log('erl')))
  );
}
