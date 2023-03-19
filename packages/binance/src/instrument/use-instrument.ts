import { map, Observable } from 'rxjs';

import { Instrument, instrumentNotSupported, InstrumentSelector } from '@quantform/core';

import { useInstruments } from './use-instruments';

/**
 * @title useBinanceInstrument
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export function useInstrument(
  instrument: InstrumentSelector
): Observable<Instrument | typeof instrumentNotSupported> {
  return useInstruments().pipe(
    map(it => it.find(it => it.id === instrument.id) ?? instrumentNotSupported)
  );
}