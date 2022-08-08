import { from } from 'rxjs';

import { Candle } from '../domain';
import { decimal, now } from '../shared';
import { sma } from './sma';
import { trueRange } from './true-range';

describe('trueRange', () => {
  test('should return expected value', done => {
    let value: decimal;

    //12 Dec 2020 00:00
    from([
      new Candle(
        now(),
        new decimal(18127.81),
        new decimal(18149.75),
        new decimal(18100.0),
        new decimal(18136.17)
      ),
      new Candle(
        now(),
        new decimal(18136.17),
        new decimal(18136.18),
        new decimal(18089.75),
        new decimal(18092.15)
      ),
      new Candle(
        now(),
        new decimal(18092.15),
        new decimal(18120.03),
        new decimal(18081.0),
        new decimal(18082.39)
      ),
      new Candle(
        now(),
        new decimal(18082.39),
        new decimal(18087.04),
        new decimal(18041.0),
        new decimal(18065.4)
      ),
      new Candle(
        now(),
        new decimal(18066.11),
        new decimal(18079.15),
        new decimal(18041.0),
        new decimal(18046.47)
      )
    ])
      .pipe(
        trueRange(it => it),
        sma(4, ([, it]) => it)
      )
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(new decimal(42.41));
          done();
        }
      });
  });
});
