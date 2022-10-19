import { d, decimal, now, Ohlc } from '@quantform/core';
import { from } from 'rxjs';

import { sma } from './sma';
import { trueRange } from './true-range';

describe('trueRange', () => {
  test('should return expected value', done => {
    let value: decimal;

    //12 Dec 2020 00:00
    from([
      new Ohlc(now(), d(18127.81), d(18149.75), d(18100.0), d(18136.17)),
      new Ohlc(now(), d(18136.17), d(18136.18), d(18089.75), d(18092.15)),
      new Ohlc(now(), d(18092.15), d(18120.03), d(18081.0), d(18082.39)),
      new Ohlc(now(), d(18082.39), d(18087.04), d(18041.0), d(18065.4)),
      new Ohlc(now(), d(18066.11), d(18079.15), d(18041.0), d(18046.47))
    ])
      .pipe(
        trueRange(it => it),
        sma(4, ([, it]) => it)
      )
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(d(42.41));
          done();
        }
      });
  });
});
