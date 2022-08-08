import { from } from 'rxjs';

import { decimal } from '../shared';
import { sma } from './sma';

describe('sma', () => {
  test('should return expected value', done => {
    let value: decimal;

    //12 Dec 2020 00:00
    from([18136.17, 18092.15, 18082.39, 18065.4, 18046.47])
      .pipe(sma(5, it => new decimal(it)))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(new decimal(18084.52));
          done();
        }
      });
  });
});
