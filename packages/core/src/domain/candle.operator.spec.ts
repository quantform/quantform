import decimal from 'decimal.js';
import { from } from 'rxjs';

import { Candle } from './candle';
import { candle, candleCompleted, mergeCandle } from './candle.operator';

describe('candle', () => {
  test('should aggregate and pipe candle updates', done => {
    const input$ = from([
      { timestamp: 1, rate: new decimal(1) },
      { timestamp: 2, rate: new decimal(2) },
      { timestamp: 3, rate: new decimal(3) },
      { timestamp: 4, rate: new decimal(0) },
      { timestamp: 5, rate: new decimal(7) },
      { timestamp: 6, rate: new decimal(8) }
    ]);

    const output = [
      new Candle(0, new decimal(1), new decimal(2), new decimal(1), new decimal(2)),
      new Candle(0, new decimal(1), new decimal(1), new decimal(1), new decimal(1)),
      new Candle(0, new decimal(1), new decimal(3), new decimal(1), new decimal(3)),
      new Candle(0, new decimal(1), new decimal(3), new decimal(0), new decimal(0)),
      new Candle(5, new decimal(0), new decimal(7), new decimal(7), new decimal(7)),
      new Candle(5, new decimal(0), new decimal(8), new decimal(7), new decimal(8))
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
      { timestamp: 1, rate: new decimal(1) },
      { timestamp: 2, rate: new decimal(2) },
      { timestamp: 3, rate: new decimal(3) },
      { timestamp: 4, rate: new decimal(0) },
      { timestamp: 5, rate: new decimal(7) },
      { timestamp: 6, rate: new decimal(8) }
    ]);

    input$
      .pipe(
        candle(5, it => it.rate),
        candleCompleted()
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(
            new Candle(0, new decimal(1), new decimal(3), new decimal(0), new decimal(0))
          );
          done();
        }
      });
  });
});

describe('mergeCandle', () => {
  test('should pipe and merge candle from history', done => {
    const history$ = from([
      new Candle(1, new decimal(1), new decimal(1.5), new decimal(0.5), new decimal(2)),
      new Candle(2, new decimal(2), new decimal(2.5), new decimal(1.5), new decimal(3)),
      new Candle(3, new decimal(3), new decimal(3.5), new decimal(2.5), new decimal(4))
    ]);

    const input$ = from([
      { timestamp: 3, rate: new decimal(5) },
      { timestamp: 4, rate: new decimal(3) },
      { timestamp: 5, rate: new decimal(4) }
    ]);

    const output = [
      new Candle(1, new decimal(1), new decimal(1.5), new decimal(0.5), new decimal(2)),
      new Candle(2, new decimal(2), new decimal(2.5), new decimal(1.5), new decimal(3)),
      new Candle(3, new decimal(3), new decimal(5), new decimal(2.5), new decimal(5)),
      new Candle(4, new decimal(5), new decimal(3), new decimal(3), new decimal(3)),
      new Candle(5, new decimal(3), new decimal(4), new decimal(4), new decimal(4))
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
      new Candle(1, new decimal(1), new decimal(1.5), new decimal(0.5), new decimal(2)),
      new Candle(2, new decimal(2), new decimal(2.5), new decimal(1.5), new decimal(3)),
      new Candle(3, new decimal(3), new decimal(3.5), new decimal(2.5), new decimal(4))
    ]);

    const input$ = from([
      { timestamp: 4, rate: new decimal(5) },
      { timestamp: 5, rate: new decimal(3) },
      { timestamp: 6, rate: new decimal(4) }
    ]);

    const output = [
      new Candle(1, new decimal(1), new decimal(1.5), new decimal(0.5), new decimal(2)),
      new Candle(2, new decimal(2), new decimal(2.5), new decimal(1.5), new decimal(3)),
      new Candle(3, new decimal(3), new decimal(3.5), new decimal(2.5), new decimal(4)),
      new Candle(4, new decimal(4), new decimal(5), new decimal(5), new decimal(5)),
      new Candle(5, new decimal(5), new decimal(3), new decimal(3), new decimal(3)),
      new Candle(6, new decimal(3), new decimal(4), new decimal(4), new decimal(4))
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
