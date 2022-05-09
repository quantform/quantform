import { Subject } from 'rxjs';

import { State } from '../store';
import { Asset } from './asset';
import { Component } from './component';
import { Instrument } from './instrument';
import { Trade } from './trade';
import { trade } from './trade.operator';

describe('trade', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  const state = new State();

  beforeEach(() => {
    state.trade.upsert(new Trade(instrument));
  });

  test('should pipe an orderbook on subscription', done => {
    new Subject<Component>().pipe(trade(instrument, state)).subscribe({
      next: it => {
        expect(it.id).toEqual(instrument.id);
        done();
      }
    });
  });
});
