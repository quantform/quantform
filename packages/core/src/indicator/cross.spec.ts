import { from, map } from 'rxjs';

import { d } from '../shared';
import { crossOver, crossUnder } from './cross';

describe('crossUnder', () => {
  test('should crossUnder uptrend once', done => {
    from([1, 2, 3, 4, 5])
      .pipe(
        map(it => d(it)),
        crossUnder(d(3), it => it)
      )
      .subscribe({
        next: it => expect(it).toEqual(d(4)),
        complete: done()
      });
  });

  test('should crossUnder uptrend twice', done => {
    let crosses = 0;

    from([1, 2, 3, 4, 5, 4, 2, 3, 3, 3, 4, 5])
      .pipe(
        map(it => d(it)),
        crossUnder(d(3), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(d(4));
          crosses++;
        },
        complete: () => {
          expect(crosses).toEqual(2);
          done();
        }
      });
  });

  test('should not cross bounce', done => {
    let crosses = 0;

    from([1, 2, 3, 4, 5, 4, 3, 3, 4, 5])
      .pipe(
        map(it => d(it)),
        crossUnder(d(3), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(d(4));
          crosses++;
        },
        complete: () => {
          expect(crosses).toEqual(1);
          done();
        }
      });
  });

  test('should not cross downtrend', done => {
    from([5, 4, 3, 2, 1])
      .pipe(
        map(it => d(it)),
        crossUnder(d(3), it => it)
      )
      .subscribe({
        next: () => fail(),
        complete: done()
      });
  });
});

describe('crossover', () => {
  test('should crossover downtrend once', done => {
    from([5, 4, 3, 2, 1])
      .pipe(
        map(it => d(it)),
        crossOver(d(3), it => it)
      )
      .subscribe({
        next: it => expect(it).toEqual(d(2)),
        complete: done()
      });
  });

  test('should crossover downtrend twice', done => {
    let crosses = 0;

    from([5, 4, 3, 2, 1, 2, 2, 3, 4, 4, 2, 3])
      .pipe(
        map(it => d(it)),
        crossOver(d(3), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(d(2));
          crosses++;
        },
        complete: () => {
          expect(crosses).toEqual(2);
          done();
        }
      });
  });

  test('should not cross bounce', done => {
    let crosses = 0;

    from([5, 4, 3, 2, 1, 2, 3, 3, 4, 5])
      .pipe(
        map(it => d(it)),
        crossOver(d(3), it => it)
      )
      .subscribe({
        next: it => {
          expect(it).toEqual(d(2));
          crosses++;
        },
        complete: () => {
          expect(crosses).toEqual(1);
          done();
        }
      });
  });

  test('should not cross uptrend', done => {
    from([1, 2, 3, 4, 5])
      .pipe(
        map(it => d(it)),
        crossOver(d(3), it => it)
      )
      .subscribe({
        next: () => fail(),
        complete: done()
      });
  });
});
