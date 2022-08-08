import { from, map } from 'rxjs';

import { decimal } from '../shared';
import { trailingDown, trailingUp } from './trailing';

describe('trailingUp', () => {
  test('should trigger uptrend once', done => {
    let triggered = false;

    from([1, 2, 3, 2, 3])
      .pipe(
        map(it => new decimal(it)),
        trailingUp(new decimal(3), new decimal(1), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(new decimal(2));
          triggered = true;
        },
        complete: () => {
          expect(triggered).toEqual(true);
          done();
        }
      });
  });

  test('should trigger uptrend twice', done => {
    let triggered = 0;

    from([1, 2, 3, 2, 3, 2, 3])
      .pipe(
        map(it => new decimal(it)),
        trailingUp(new decimal(3), new decimal(1), it => it)
      )
      .subscribe({
        next: it => {
          expect(new decimal(it)).toEqual(new decimal(2));
          triggered++;
        },
        complete: () => {
          expect(triggered).toEqual(2);
          done();
        }
      });
  });
});

describe('trailingDown', () => {
  test('should trigger downtrend once', done => {
    let triggered = false;

    from([3, 2, 1, 2, 1])
      .pipe(
        map(it => new decimal(it)),
        trailingDown(new decimal(3), new decimal(1), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(new decimal(2));
          triggered = true;
        },
        complete: () => {
          expect(triggered).toEqual(true);
          done();
        }
      });
  });

  test('should trigger downtrend twice', done => {
    let triggered = 0;

    from([3, 2, 1, 2, 1, 2, 1])
      .pipe(
        map(it => new decimal(it)),
        trailingDown(new decimal(3), new decimal(1), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(new decimal(2));
          triggered++;
        },
        complete: () => {
          expect(triggered).toEqual(2);
          done();
        }
      });
  });
});
