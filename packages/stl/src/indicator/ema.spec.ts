import { from } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { ema } from '@lib/indicator';

describe(ema.name, () => {
  test('should return expected value', done => {
    let value: decimal;

    from([
      212.8, 214.06, 213.89, 214.66, 213.95, 213.95, 214.55, 214.02, 214.51, 213.75,
      214.22, 213.43, 214.21, 213.66, 215.03, 216.89, 216.66, 216.32, 214.98, 214.96,
      215.05, 215.19
    ])
      .pipe(ema(20, it => d(it)))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(value.toDecimalPlaces(4)).toEqual(d(214.6336));
          done();
        }
      });
  });
  /*
  test('should return expected value', done => {
    let value;

    //12 Dec 2020 00:00
    from([18136.17, 18092.15, 18082.39, 18065.4, 18046.47])
      .pipe(ema(5, it => it))
      .subscribe({
        next: it => (value = it.value),
        complete: () => {
          expect(parseFloat(value.toFixed(2))).toBe(18076.28);
          done();
        }
      });
  });*/
});
