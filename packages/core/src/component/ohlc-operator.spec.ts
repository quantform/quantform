import { from } from 'rxjs';

import { mergeOhlc, Ohlc, ohlc, ohlcCompleted } from '@lib/component';
import { d } from '@lib/shared';

describe(ohlc.name, () => {
  test('should aggregate and pipe ohlc updates', done => {
    const input$ = from([
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d.Zero },
      { timestamp: 5, rate: d(7) },
      { timestamp: 6, rate: d(8) }
    ]);

    const output = [
      new Ohlc(0, d(1), d(1), d(1), d(1)),
      new Ohlc(0, d(1), d(2), d(1), d(2)),
      new Ohlc(0, d(1), d(3), d(1), d(3)),
      new Ohlc(0, d(1), d(3), d.Zero, d.Zero),
      new Ohlc(5, d.Zero, d(7), d(7), d(7)),
      new Ohlc(5, d.Zero, d(8), d(7), d(8))
    ].reverse();

    input$.pipe(ohlc(5, it => it.rate)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });
});

describe(ohlcCompleted.name, () => {
  test('should aggregate and pipe distinct completed ohlc', done => {
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
        ohlc(5, it => it.rate),
        ohlcCompleted()
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(new Ohlc(0, d(1), d(3), d.Zero, d.Zero));
          done();
        }
      });
  });
});

describe(mergeOhlc.name, () => {
  test('should pipe and merge ohlc from history', done => {
    const history$ = from([
      new Ohlc(1, d(1), d(1.5), d(0.5), d(2)),
      new Ohlc(2, d(2), d(2.5), d(1.5), d(3)),
      new Ohlc(3, d(3), d(3.5), d(2.5), d(4))
    ]);

    const input$ = from([
      { timestamp: 3, rate: d(5) },
      { timestamp: 4, rate: d(3) },
      { timestamp: 5, rate: d(4) }
    ]);

    const output = [
      new Ohlc(1, d(1), d(1.5), d(0.5), d(2)),
      new Ohlc(2, d(2), d(2.5), d(1.5), d(3)),
      new Ohlc(3, d(3), d(5), d(2.5), d(5)),
      new Ohlc(4, d(5), d(3), d(3), d(3)),
      new Ohlc(5, d(3), d(4), d(4), d(4))
    ].reverse();

    input$.pipe(mergeOhlc(1, it => it.rate, history$)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });

  test('should pipe and not merge ohlc from history', done => {
    const history$ = from([
      new Ohlc(1, d(1), d(1.5), d(0.5), d(2)),
      new Ohlc(2, d(2), d(2.5), d(1.5), d(3)),
      new Ohlc(3, d(3), d(3.5), d(2.5), d(4))
    ]);

    const input$ = from([
      { timestamp: 4, rate: d(5) },
      { timestamp: 5, rate: d(3) },
      { timestamp: 6, rate: d(4) }
    ]);

    const output = [
      new Ohlc(1, d(1), d(1.5), d(0.5), d(2)),
      new Ohlc(2, d(2), d(2.5), d(1.5), d(3)),
      new Ohlc(3, d(3), d(3.5), d(2.5), d(4)),
      new Ohlc(4, d(4), d(5), d(5), d(5)),
      new Ohlc(5, d(5), d(3), d(3), d(3)),
      new Ohlc(6, d(3), d(4), d(4), d(4))
    ].reverse();

    input$.pipe(mergeOhlc(1, it => it.rate, history$)).subscribe({
      next: it => {
        expect(it).toEqual(output.pop());
        if (output.length === 0) {
          done();
        }
      }
    });
  });
});
