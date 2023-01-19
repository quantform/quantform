import { map, Observable } from 'rxjs';

import { Instrument, InstrumentSelector } from '@quantform/core';

import { useBinanceInstruments } from './use-binance-instruments';

export const instrumentNotSupported = Symbol('Instrument not supported!');

export function useBinanceInstrument(
  instrument: InstrumentSelector
): Observable<Instrument | typeof instrumentNotSupported> {
  return useBinanceInstruments().pipe(
    map(it => it.find(it => it.id === instrument.id) ?? instrumentNotSupported)
  );
}
