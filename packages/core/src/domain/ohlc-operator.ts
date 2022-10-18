import {
  concat,
  filter,
  last,
  map,
  mergeMap,
  Observable,
  OperatorFunction,
  share,
  skipLast,
  switchMap
} from 'rxjs';

import { decimal } from '../shared';
import { Ohlc } from './ohlc';
import { tf } from './timeframe';

function aggregate(
  candle: Ohlc | undefined,
  timeframe: number,
  value: decimal,
  timestamp: number
) {
  const frame = tf(timestamp, timeframe);

  if (!candle) {
    return new Ohlc(frame, value, value, value, value);
  }

  if (candle.timestamp === frame) {
    candle.apply(value);
    return undefined;
  } else {
    return new Ohlc(frame, candle.close, value, value, value);
  }
}

export function ohlc<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => decimal,
  candleToStartWith?: Ohlc
) {
  return function (source: Observable<T>): Observable<Ohlc> {
    let candle = candleToStartWith;

    return source.pipe(
      map(it => {
        const newCandle = aggregate(candle, timeframe, fn(it), it.timestamp);
        if (newCandle) {
          const prevCandle = candle;
          candle = newCandle;

          if (candleToStartWith && candleToStartWith.timestamp < newCandle.timestamp) {
            candleToStartWith = undefined;

            if (prevCandle) {
              return [prevCandle, candle];
            }

            return [candle];
          }
        }

        if (candleToStartWith) {
          candleToStartWith = undefined;
        }

        if (candle) {
          return [candle];
        }

        return [];
      }),
      mergeMap(it => it),
      share()
    );
  };
}

export function mergeOhlc<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => decimal,
  history$: Observable<Ohlc>
) {
  return function (source$: Observable<T>): Observable<Ohlc> {
    return concat(
      history$.pipe(skipLast(1)),
      history$.pipe(
        last(),
        switchMap(lastHistoricalCandle =>
          source$.pipe(ohlc(timeframe, fn, lastHistoricalCandle))
        ),
        share()
      )
    );
  };
}

export function ohlcCompleted(): (source: Observable<Ohlc>) => Observable<Ohlc> {
  let currCandle: Ohlc;

  return (source: Observable<Ohlc>) =>
    source.pipe(
      map(it => {
        if (!currCandle) {
          currCandle = it;

          return undefined;
        } else {
          if (currCandle.timestamp !== it.timestamp) {
            const prevCandle = currCandle;
            currCandle = it;

            return prevCandle;
          }

          return undefined;
        }
      }),
      filter(it => it !== undefined) as OperatorFunction<Ohlc | undefined, Ohlc>,
      share()
    );
}
