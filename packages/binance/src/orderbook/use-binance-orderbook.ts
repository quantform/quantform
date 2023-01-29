import { Observable, of, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector } from '@quantform/core';

import { useBinanceOrderbookDepth } from './use-binance-orderbook-depth';
import { useBinanceOrderbookTicker } from './use-binance-orderbook-ticker';

type OrderbookType = {
  ticker: ReturnType<typeof useBinanceOrderbookTicker>;
  '5@100ms': ReturnType<typeof useBinanceOrderbookDepth>;
  '5@1000ms': ReturnType<typeof useBinanceOrderbookDepth>;
  '10@100ms': ReturnType<typeof useBinanceOrderbookDepth>;
  '10@1000ms': ReturnType<typeof useBinanceOrderbookDepth>;
  '20@100ms': ReturnType<typeof useBinanceOrderbookDepth>;
  '20@1000ms': ReturnType<typeof useBinanceOrderbookDepth>;
};

export function useBinanceOrderbook<T extends keyof OrderbookType>(
  instrument: InstrumentSelector,
  type: T
): OrderbookType[T] | Observable<typeof instrumentNotSupported> {
  const i = useBinanceInstrument(instrument).pipe();

  switch (type) {
    case '5@100ms':
    case '5@1000ms':
    case '10@100ms':
    case '10@1000ms':
    case '20@100ms':
    case '20@1000ms':
      return i.pipe(
        switchMap(it => {
          if (it === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          return useBinanceOrderbookDepth(it, type);
        })
      ) as OrderbookType[T];

    default:
      return i.pipe(
        switchMap(it => {
          if (it === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          return useBinanceOrderbookTicker(it);
        })
      ) as OrderbookType[T];
  }
}
