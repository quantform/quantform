import { Subject } from 'rxjs';

import { d } from '../shared';
import { State } from '../store';
import { Asset } from './asset';
import { Commission } from './commission';
import { Component } from './component';
import { Instrument } from './instrument';
import { Trade } from './trade';
import { trade } from './trade-operator';

describe('trade', () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  const state = new State();

  beforeEach(() => {
    state.trade.upsert(new Trade(0, instrument, d.Zero, d.Zero));
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
