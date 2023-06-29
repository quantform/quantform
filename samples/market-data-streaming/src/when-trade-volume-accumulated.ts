import { map } from 'rxjs';

import { useBinance } from '@quantform/binance';
import { d, errored, InstrumentSelector, useLogger } from '@quantform/core';

/**
 * Subscribe for given instrument market data and aggregate the volume.
 */
export function whenTradeVolumeAccumulated(instrument: InstrumentSelector) {
  const { whenTrade } = useBinance();
  const { error } = useLogger(whenTradeVolumeAccumulated.name);

  let volume = d.Zero;

  return whenTrade(instrument).pipe(
    map(it => {
      if (it === errored) {
        error(`lost market stream for: ${instrument}`);

        return volume;
      }

      volume = volume.add(it.quantity);

      return volume;
    })
  );
}
