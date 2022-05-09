import {
  concat,
  filter,
  last,
  map,
  mergeMap,
  Observable,
  share,
  skipLast,
  switchMap
} from 'rxjs';

import { Candle } from './candle';
import { tf } from './timeframe';

function aggregate(candle: Candle, timeframe: number, value: number, timestamp: number) {
  const frame = tf(timestamp, timeframe);

  if (!candle) {
    return new Candle(frame, value, value, value, value);
  }

  if (candle.timestamp === frame) {
    candle.apply(value);
  } else {
    return new Candle(frame, candle.close, value, value, value);
  }
}

export function candle<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => number,
  candleToStartWith: Candle = undefined
) {
  return function (source: Observable<T>): Observable<Candle> {
    let candle = candleToStartWith;

    return source.pipe(
      map(it => {
        const newCandle = aggregate(candle, timeframe, fn(it), it.timestamp);
        if (newCandle) {
          const prevCandle = candle;
          candle = newCandle;

          if (candleToStartWith && candleToStartWith.timestamp < newCandle.timestamp) {
            candleToStartWith = undefined;
            return [prevCandle, candle];
          }
        }

        if (candleToStartWith) {
          candleToStartWith = undefined;
        }

        return [candle];
      }),
      mergeMap(it => it),
      share()
    );
  };
}

export function mergeCandle<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => number,
  history$: Observable<Candle>
) {
  return function (source$: Observable<T>): Observable<Candle> {
    return concat(
      history$.pipe(skipLast(1)),
      history$.pipe(
        last(),
        switchMap(lastHistoricalCandle =>
          source$.pipe(candle(timeframe, fn, lastHistoricalCandle))
        ),
        share()
      )
    );
  };
}

export function candleCompleted(): (source: Observable<Candle>) => Observable<Candle> {
  let currCandle: Candle;

  return (source: Observable<Candle>) =>
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
      filter(it => !!it),
      share()
    );
}
