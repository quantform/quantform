import { from } from 'rxjs';

import { wma } from './wma';

describe('wma tests', () => {
  test('should return expected value', done => {
    let value;
    //12 Dec 2020 00:00
    from([18136.17, 18092.15, 18082.39, 18065.4, 18046.47])
      .pipe(wma(5, it => it))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(parseFloat(value.toFixed(2))).toBe(18070.77);
          done();
        }
      });
  });
});
