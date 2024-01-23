import { catchError, map, retry, throwError } from 'rxjs';

import { useBinance } from '@quantform/binance';
import { d, InstrumentSelector, useLogger } from '@quantform/core';

/**
 * Subscribe for given instrument market data and aggregate the volume.
 */
export function whenTradeVolumeAccumulated(instrument: InstrumentSelector) {
  const { whenTrade } = useBinance();
  const { error } = useLogger(whenTradeVolumeAccumulated.name);

  let volume = d.Zero;

  return whenTrade(instrument).pipe(
    map(it => {
      volume = volume.add(it.quantity);

      return volume;
    }),
    catchError(e => {
      error('connection lost...', e);

      return throwError(() => e);
    }),
    retry({ count: 5, delay: 1000 })
  );
}
