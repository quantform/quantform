import { from } from 'rxjs';

import { crossover, crossunder } from './cross';

describe('crossunder', () => {
  test('should crossunder uptrend once', done => {
    from([1, 2, 3, 4, 5])
      .pipe(
        crossunder(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => expect(it).toBe(4),
        complete: done()
      });
  });

  test('should crossunder uptrend twice', done => {
    let crosses = 0;

    from([1, 2, 3, 4, 5, 4, 2, 3, 3, 3, 4, 5])
      .pipe(
        crossunder(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => {
          expect(it).toBe(4);
          crosses++;
        },
        complete: () => {
          expect(crosses).toBe(2);
          done();
        }
      });
  });

  test('should not cross bounce', done => {
    let crosses = 0;

    from([1, 2, 3, 4, 5, 4, 3, 3, 4, 5])
      .pipe(
        crossunder(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => {
          expect(it).toBe(4);
          crosses++;
        },
        complete: () => {
          expect(crosses).toBe(1);
          done();
        }
      });
  });

  test('should not cross downtrend', done => {
    from([5, 4, 3, 2, 1])
      .pipe(
        crossunder(
          () => 3,
          it => it
        )
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
        crossover(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => expect(it).toBe(2),
        complete: done()
      });
  });

  test('should crossover downtrend twice', done => {
    let crosses = 0;

    from([5, 4, 3, 2, 1, 2, 2, 3, 4, 4, 2, 3])
      .pipe(
        crossover(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          crosses++;
        },
        complete: () => {
          expect(crosses).toBe(2);
          done();
        }
      });
  });

  test('should not cross bounce', done => {
    let crosses = 0;

    from([5, 4, 3, 2, 1, 2, 3, 3, 4, 5])
      .pipe(
        crossover(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: it => {
          expect(it).toBe(2);
          crosses++;
        },
        complete: () => {
          expect(crosses).toBe(1);
          done();
        }
      });
  });

  test('should not cross uptrend', done => {
    from([1, 2, 3, 4, 5])
      .pipe(
        crossover(
          () => 3,
          it => it
        )
      )
      .subscribe({
        next: () => fail(),
        complete: done()
      });
  });
});
