import { from } from 'rxjs';
import { Candle } from '../domain';
import { now } from '../shared';
import { sma } from './sma';
import { truerange } from './truerange';

describe('truerange atr tests', () => {
  test('should return expected value', done => {
    let value;

    //12 Dec 2020 00:00
    from([
      new Candle(now(), 18127.81, 18149.75, 18100.0, 18136.17),
      new Candle(now(), 18136.17, 18136.18, 18089.75, 18092.15),
      new Candle(now(), 18092.15, 18120.03, 18081.0, 18082.39),
      new Candle(now(), 18082.39, 18087.04, 18041.0, 18065.4),
      new Candle(now(), 18066.11, 18079.15, 18041.0, 18046.47)
    ])
      .pipe(
        truerange(it => it),
        sma(4, ([, it]) => it)
      )
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(parseFloat(value.toFixed(2))).toBe(42.41);
          done();
        }
      });
  });
});
