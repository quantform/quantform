import { map } from 'rxjs';

import { InstrumentSelector, MissingInstrumentError, withMemo } from '@quantform/core';

import { getInstruments } from './get-instruments';

export const getInstrument = withMemo((instrument: InstrumentSelector) =>
  getInstruments().pipe(
    map(it => {
      const ref = it.find(it => it.id === instrument.id);

      if (!ref) {
        throw new MissingInstrumentError(instrument);
      }

      return ref;
    })
  )
);
