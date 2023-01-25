import { map, Observable, of, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { instrumentOf, InstrumentSelector } from '@quantform/core';

import { useBinanceOrderbookPartial } from './use-binance-orderbook-partial';
import { useBinanceOrderbookTicker } from './use-binance-orderbook-ticker';

type OrderbookType = {
  ticker: ReturnType<typeof useBinanceOrderbookTicker>;
  'partial-5': ReturnType<typeof useBinanceOrderbookPartial>;
  'partial-10': ReturnType<typeof useBinanceOrderbookPartial>;
  'partial-20': ReturnType<typeof useBinanceOrderbookPartial>;
};

export function useBinanceOrderbook<T extends keyof OrderbookType>(
  instrument: InstrumentSelector,
  type: T
): OrderbookType[T] | Observable<typeof instrumentNotSupported> | never {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      if (type === 'ticker') {
        return useBinanceOrderbookTicker(it);
      }

      if (type === 'partial-5') {
        return useBinanceOrderbookPartial(it, 5);
      }

      if (type === 'partial-10') {
        return useBinanceOrderbookPartial(it, 5);
      }

      if (type === 'partial-20') {
        return useBinanceOrderbookPartial(it, 5);
      }
    })
  );
}

useBinanceOrderbook(instrumentOf('f'), 'ticker').pipe(
  map(it => {
    if (it !== instrumentNotSupported) {
      it.asks;
    }
  })
);
