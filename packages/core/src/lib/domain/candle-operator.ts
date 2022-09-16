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
import { Candle } from './candle';
import { tf } from './timeframe';

function aggregate(
  candle: Candle | undefined,
  timeframe: number,
  value: decimal,
  timestamp: number
) {
  const frame = tf(timestamp, timeframe);

  if (!candle) {
    return new Candle(frame, value, value, value, value);
  }

  if (candle.timestamp === frame) {
    candle.apply(value);
    return undefined;
  } else {
    return new Candle(frame, candle.close, value, value, value);
  }
}

export function candle<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => decimal,
  candleToStartWith?: Candle
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

export function mergeCandle<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => decimal,
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
      filter(it => it !== undefined) as OperatorFunction<Candle | undefined, Candle>,
      share()
    );
}
