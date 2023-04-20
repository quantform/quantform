import { map } from 'rxjs';

import { InstrumentSelector, missed, use } from '@quantform/core';

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
export const useBinanceInstrument = use((instrument: InstrumentSelector) =>
  useBinanceInstruments().pipe(
    map(it => it.find(it => it.id === instrument.id) ?? missed)
  )
);
