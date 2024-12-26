import { map } from 'rxjs';

import { InstrumentSelector, MissingInstrumentError, useMemo } from '@quantform/core';

import { getInstruments } from './get-instruments';

export function getInstrument(instrument: InstrumentSelector) {
  return useMemo(
    () =>
      getInstruments().pipe(
        map(it => {
          const ref = it.find(it => it.id === instrument.id);

          if (!ref) {
            throw new MissingInstrumentError(instrument);
          }

          return ref;
        })
      ),
    ['hyperliquid', 'perpetual', 'get-instrument', instrument]
  );
}
