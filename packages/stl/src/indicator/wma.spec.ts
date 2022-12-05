import { from } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { wma } from '@lib/indicator';

describe(wma.name, () => {
  test('should return expected value', done => {
    let value: decimal;
    //12 Dec 2020 00:00
    from([d(18136.17), d(18092.15), d(18082.39), d(18065.4), d(18046.47)])
      .pipe(wma(5, it => it))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(2)).toEqual(d(18070.77));
          done();
        }
      });
  });
});
