import { from } from 'rxjs';

import { trailingdown, trailingup } from './trailing';

describe('trailing up tests', () => {
  test('should trigger uptrend once', done => {
    let triggered = false;

    from([1, 2, 3, 2, 3])
      .pipe(trailingup(3, 1, it => it))
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          triggered = true;
        },
        complete: () => {
          expect(triggered).toBe(true);
          done();
        }
      });
  });

  test('should trigger uptrend twice', done => {
    let triggered = 0;

    from([1, 2, 3, 2, 3, 2, 3])
      .pipe(trailingup(3, 1, it => it))
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          triggered++;
        },
        complete: () => {
          expect(triggered).toBe(2);
          done();
        }
      });
  });
});

describe('trailingdown tests', () => {
  test('should trigger downtrend once', done => {
    let triggered = false;

    from([3, 2, 1, 2, 1])
      .pipe(trailingdown(3, 1, it => it))
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          triggered = true;
        },
        complete: () => {
          expect(triggered).toBe(true);
          done();
        }
      });
  });

  test('should trigger downtrend twice', done => {
    let triggered = 0;

    from([3, 2, 1, 2, 1, 2, 1])
      .pipe(trailingdown(3, 1, it => it))
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          triggered++;
        },
        complete: () => {
          expect(triggered).toBe(2);
          done();
        }
      });
  });
});
