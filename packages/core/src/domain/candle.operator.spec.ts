import { from } from 'rxjs';

import { d } from '../shared';
import { Candle } from './candle';
import { candle, candleCompleted, mergeCandle } from './candle.operator';

describe('candle', () => {
  test('should aggregate and pipe candle updates', done => {
    const input$ = from([
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d.Zero },
      { timestamp: 5, rate: d(7) },
      { timestamp: 6, rate: d(8) }
    ]);

    const output = [
      new Candle(0, d(1), d(1), d(1), d(1)),
      new Candle(0, d(1), d(2), d(1), d(2)),
      new Candle(0, d(1), d(3), d(1), d(3)),
      new Candle(0, d(1), d(3), d.Zero, d.Zero),
      new Candle(5, d.Zero, d(7), d(7), d(7)),
      new Candle(5, d.Zero, d(8), d(7), d(8))
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
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d.Zero },
      { timestamp: 5, rate: d(7) },
      { timestamp: 6, rate: d(8) }
    ]);

    input$
      .pipe(
        candle(5, it => it.rate),
        candleCompleted()
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(new Candle(0, d(1), d(3), d.Zero, d.Zero));
          done();
        }
      });
  });
});

describe('mergeCandle', () => {
  test('should pipe and merge candle from history', done => {
    const history$ = from([
      new Candle(1, d(1), d(1.5), d(0.5), d(2)),
      new Candle(2, d(2), d(2.5), d(1.5), d(3)),
      new Candle(3, d(3), d(3.5), d(2.5), d(4))
    ]);

    const input$ = from([
      { timestamp: 3, rate: d(5) },
      { timestamp: 4, rate: d(3) },
      { timestamp: 5, rate: d(4) }
    ]);

    const output = [
      new Candle(1, d(1), d(1.5), d(0.5), d(2)),
      new Candle(2, d(2), d(2.5), d(1.5), d(3)),
      new Candle(3, d(3), d(5), d(2.5), d(5)),
      new Candle(4, d(5), d(3), d(3), d(3)),
      new Candle(5, d(3), d(4), d(4), d(4))
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
      new Candle(1, d(1), d(1.5), d(0.5), d(2)),
      new Candle(2, d(2), d(2.5), d(1.5), d(3)),
      new Candle(3, d(3), d(3.5), d(2.5), d(4))
    ]);

    const input$ = from([
      { timestamp: 4, rate: d(5) },
      { timestamp: 5, rate: d(3) },
      { timestamp: 6, rate: d(4) }
    ]);

    const output = [
      new Candle(1, d(1), d(1.5), d(0.5), d(2)),
      new Candle(2, d(2), d(2.5), d(1.5), d(3)),
      new Candle(3, d(3), d(3.5), d(2.5), d(4)),
      new Candle(4, d(4), d(5), d(5), d(5)),
      new Candle(5, d(5), d(3), d(3), d(3)),
      new Candle(6, d(3), d(4), d(4), d(4))
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
