import {
  concat,
  filter,
  last,
  map,
  mergeMap,
  Observable,
  share,
  skipLast,
  withLatestFrom
} from 'rxjs';
import { timestamp } from '../shared';
import { tf } from './timeframe';

export class Candle {
  constructor(
    public timestamp: timestamp,
    public open: number,
    public high: number,
    public low: number,
    public close: number
  ) {}

  apply(value: number) {
    this.high = Math.max(this.high, value);
    this.low = Math.min(this.low, value);
    this.close = value;
  }
}

export class CandleBuilder {
  private _candle: Candle;

  get candle(): Candle {
    return this._candle;
  }

  constructor(readonly timeframe: number) {}

  append(value: number, timestamp: timestamp): Candle {
    const frame = tf(timestamp, this.timeframe);

    if (!this._candle) {
      this._candle = new Candle(frame, value, value, value, value);

      return null;
    }

    if (this.candle.timestamp == frame) {
      this.candle.apply(value);

      return null;
    }

    const previous = this._candle;

    this._candle = new Candle(frame, value, value, value, value);
    return previous;
  }
}

export function candle<T extends { timestamp: number }>(
  timeframe: number,
  fn: (x: T) => number
) {
  return function (source: Observable<T>): Observable<Candle> {
    const builder = new CandleBuilder(timeframe);
    let candle: Candle;

    return source.pipe(
      filter(it => {
        return (candle = builder.append(fn(it), it.timestamp)) != null;
      }),
      map(_ => candle),
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
    const builder = new CandleBuilder(timeframe);
    let hasMergedHistory = false;

    return concat(
      history$.pipe(skipLast(1)),
      source$.pipe(
        withLatestFrom(history$.pipe(last())),
        mergeMap(([it, history]) => {
          const completed = builder.append(fn(it), it.timestamp);

          if (completed) {
            if (completed.timestamp == history.timestamp) {
              completed.open = history.open;
              completed.high = Math.max(completed.high, history.high);
              completed.low = Math.min(completed.low, history.low);

              hasMergedHistory = true;
            } else if (completed.timestamp > history.timestamp) {
              if (!hasMergedHistory) {
                hasMergedHistory = true;
                return [history, completed];
              }
            } else if (completed.timestamp < history.timestamp) {
              throw new Error('invalid candle sequence, input data is to old.');
            }

            return [completed];
          }

          return [];
        })
      )
    );
  };
}
