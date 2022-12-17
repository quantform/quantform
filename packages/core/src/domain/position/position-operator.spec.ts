import { BehaviorSubject, Subject } from 'rxjs';

import {
  Asset,
  Balance,
  Commission,
  Component,
  Instrument,
  Position,
  position,
  positions
} from '@lib/domain';
import { d } from '@lib/shared';
import { State } from '@lib/store';

const instrument = new Instrument(
  0,
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def',
  Commission.Zero
);

describe(position.name, () => {
  test('should pipe a position', done => {
    new BehaviorSubject<Component>(
      new Position(0, '1', instrument, 'CROSS', d(10), d(2), 3)
    )
      .pipe(position(instrument))
      .subscribe({
        next: it => {
          expect(it.id).toEqual('1');
          done();
        }
      });
  });

  test('should skip a pipe', done => {
    new BehaviorSubject<Component>(instrument).pipe(position(instrument)).subscribe({
      next: () => fail(),
      complete: done()
    });
  });
});

describe(positions.name, () => {
  const state = new State();
  const balance = new Balance(0, instrument.quote);
  const position1 = new Position(0, '1', instrument, 'CROSS', d(10), d(2), 3);
  const position2 = new Position(0, '2', instrument, 'CROSS', d(20), d(2), 3);

  beforeEach(() => {
    state.balance.upsert(balance);

    balance.position['1'] = position1;
    balance.position['2'] = position2;
  });

  test('should pipe an array of positions on subscription start', done => {
    new Subject<Component>().pipe(positions(instrument, state)).subscribe({
      next: it => {
        expect(it.length).toEqual(2);
        done();
      }
    });
  });
});
