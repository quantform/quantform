import { BehaviorSubject, Subject } from 'rxjs';

import { d } from '../shared';
import { State } from '../store';
import { Asset } from './asset';
import { Balance } from './balance';
import { Commission } from './commission';
import { Component } from './component';
import { Instrument } from './instrument';
import { Position } from './position';
import { position, positions } from './position-operator';

const instrument = new Instrument(
  0,
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def',
  Commission.Zero
);

describe('position', () => {
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

describe('positions', () => {
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