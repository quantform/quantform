import { map, Observable } from 'rxjs';

import { Instrument, InstrumentSelector } from '@quantform/core';

import { useBinanceInstruments } from './use-binance-instruments';

/**
 *
 */
export const instrumentNotSupported = Symbol('Instrument not supported!');

/**
 * @title useBinanceInstrument
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export function useBinanceInstrument(
  instrument: InstrumentSelector
): Observable<Instrument | typeof instrumentNotSupported> {
  return useBinanceInstruments().pipe(
    map(it => it.find(it => it.id === instrument.id) ?? instrumentNotSupported)
  );
}
