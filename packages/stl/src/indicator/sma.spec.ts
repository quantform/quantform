import { from } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { sma } from '@lib/indicator';

describe(sma.name, () => {
  test('should return expected value', done => {
    let value: decimal;

    //12 Dec 2020 00:00
    from([18136.17, 18092.15, 18082.39, 18065.4, 18046.47])
      .pipe(sma(5, it => d(it)))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(d(18084.52));
          done();
        }
      });
  });
});
