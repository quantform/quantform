import { from } from 'rxjs';
import { tma } from './tma';

describe('tma tests', () => {
  test('should return expected value', done => {
    let value;

    //12 Dec 2020 00:00
    from([18086.36, 18116.15, 18127.81, 18136.17, 18092.15, 18082.39, 18065.4, 18046.47])
      .pipe(tma(4, it => it))
      .subscribe({
        next: ([, it]) => (value = it),
        complete: () => {
          expect(parseFloat(value.toFixed(2))).toBe(18090.98);
          done();
        }
      });
  });
});
