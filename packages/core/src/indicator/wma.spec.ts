import { from } from 'rxjs';

import { decimal } from '../shared';
import { wma } from './wma';

describe('wma', () => {
  test('should return expected value', done => {
    let value: decimal;
    //12 Dec 2020 00:00
    from([
      new decimal(18136.17),
      new decimal(18092.15),
      new decimal(18082.39),
      new decimal(18065.4),
      new decimal(18046.47)
    ])
      .pipe(wma(5, it => it))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(new decimal(18070.77));
          done();
        }
      });
  });
});
