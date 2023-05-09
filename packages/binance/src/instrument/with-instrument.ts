import { map } from 'rxjs';

import { InstrumentSelector, MissingInstrumentError, withMemo } from '@quantform/core';

import { withInstruments } from './with-instruments';

/**
 * @title useBinanceInstrument
 *
 * The `useBinanceInstrument` function is a utility function that retrieves a specific
 * instrument from Binance and returns it as an Observable. It takes an `InstrumentSelector`
 * object as a parameter, representing the desired instrument, and uses the
 * `useBinanceInstruments` hook to fetch all available instruments from Binance.
 * The function then searches for the instrument with the provided ID and returns it.
 * If the instrument is not found, the function throws a `MissingInstrumentError` with
 * the original `InstrumentSelector` object as an argument.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
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
