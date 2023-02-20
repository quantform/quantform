import { map, Observable, tap } from 'rxjs';

import { Instrument, InstrumentSelector } from '@quantform/core';

import { useBinanceInstruments } from './use-binance-instruments';

/**
 *
 */
export const instrumentNotSupported = Symbol('Instrument not supported!');

/**
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @param {InstrumentSelector} instrument selector
 * @returns {Observable<Instrument | InstrumentError>} the instrument or
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
