import { from } from 'rxjs';

import { Candle } from './candle';
import { candle, candleCompleted, mergeCandle } from './candle-operator';

describe('candle', () => {
  test('should aggregate and pipe candle updates', done => {
    const input$ = from([
      { timestamp: 1, rate: 1 },
      { timestamp: 2, rate: 2 },
      { timestamp: 3, rate: 3 },
      { timestamp: 4, rate: 0 },
      { timestamp: 5, rate: 7 },
      { timestamp: 6, rate: 8 }
    ]);

    const output = [
      { timestamp: 0, open: 1, high: 1, low: 1, close: 1 },
      { timestamp: 0, open: 1, high: 2, low: 1, close: 2 },
      { timestamp: 0, open: 1, high: 3, low: 1, close: 3 },
      { timestamp: 0, open: 1, high: 3, low: 0, close: 0 },
      { timestamp: 5, open: 0, high: 7, low: 7, close: 7 },
      { timestamp: 5, open: 0, high: 8, low: 7, close: 8 }
    ].reverse();

    input$.pipe(candle(5, it => it.rate)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });
});

describe('candleCompleted', () => {
  test('should aggregate and pipe distinct completed candles', done => {
    const input$ = from([
      { timestamp: 1, rate: 1 },
      { timestamp: 2, rate: 2 },
      { timestamp: 3, rate: 3 },
      { timestamp: 4, rate: 0 },
      { timestamp: 5, rate: 7 },
      { timestamp: 6, rate: 8 }
    ]);

    input$
      .pipe(
        candle(5, it => it.rate),
        candleCompleted()
      )
      .subscribe({
        next: it => {
          expect(it).toEqual({ timestamp: 0, open: 1, high: 3, low: 0, close: 0 });
          done();
        }
      });
  });
});

describe('mergeCandle', () => {
  test('should pipe and merge candle from history', done => {
    const history$ = from([
      new Candle(1, 1, 1.5, 0.5, 2),
      new Candle(2, 2, 2.5, 1.5, 3),
      new Candle(3, 3, 3.5, 2.5, 4)
    ]);

    const input$ = from([
      { timestamp: 3, rate: 5 },
      { timestamp: 4, rate: 3 },
      { timestamp: 5, rate: 4 }
    ]);

    const output = [
      { timestamp: 1, open: 1, high: 1.5, low: 0.5, close: 2 },
      { timestamp: 2, open: 2, high: 2.5, low: 1.5, close: 3 },
      { timestamp: 3, open: 3, high: 5, low: 2.5, close: 5 },
      { timestamp: 4, open: 5, high: 3, low: 3, close: 3 },
      { timestamp: 5, open: 3, high: 4, low: 4, close: 4 }
    ].reverse();

    input$.pipe(mergeCandle(1, it => it.rate, history$)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });

  test('should pipe and not merge candle from history', done => {
    const history$ = from([
      new Candle(1, 1, 1.5, 0.5, 2),
      new Candle(2, 2, 2.5, 1.5, 3),
      new Candle(3, 3, 3.5, 2.5, 4)
    ]);

    const input$ = from([
      { timestamp: 4, rate: 5 },
      { timestamp: 5, rate: 3 },
      { timestamp: 6, rate: 4 }
    ]);

    const output = [
      { timestamp: 1, open: 1, high: 1.5, low: 0.5, close: 2 },
      { timestamp: 2, open: 2, high: 2.5, low: 1.5, close: 3 },
      { timestamp: 3, open: 3, high: 3.5, low: 2.5, close: 4 },
      { timestamp: 4, open: 4, high: 5, low: 5, close: 5 },
      { timestamp: 5, open: 5, high: 3, low: 3, close: 3 },
      { timestamp: 6, open: 3, high: 4, low: 4, close: 4 }
    ].reverse();

    input$.pipe(mergeCandle(1, it => it.rate, history$)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });
});
