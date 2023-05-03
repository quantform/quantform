import { map } from 'rxjs';

import { InstrumentSelector, MissingInstrumentError, withMemo } from '@quantform/core';

import { useBinanceInstruments } from './use-binance-instruments';

/**
 * @title useBinanceInstrument
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export const useBinanceInstrument = withMemo((instrument: InstrumentSelector) =>
  useBinanceInstruments().pipe(
    map(it => {
      const ref = it.find(it => it.id === instrument.id);

      if (!ref) {
        throw new MissingInstrumentError(instrument);
      }

      return ref;
    })
  )
);
