import { map } from 'rxjs';

import { InstrumentSelector, MissingInstrumentError, withMemo } from '@quantform/core';

import { withInstruments } from './with-instruments';

export const withInstrument = withMemo((instrument: InstrumentSelector) =>
  withInstruments().pipe(
    map(it => {
      const ref = it.find(it => it.id === instrument.id);

      if (!ref) {
        throw new MissingInstrumentError(instrument);
      }

      return ref;
    })
  )
);
