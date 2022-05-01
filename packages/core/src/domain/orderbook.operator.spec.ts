import { Subject } from 'rxjs';

import { State } from '../store';
import { Asset } from './asset';
import { Component } from './component';
import { Instrument } from './instrument';
import { Orderbook } from './orderbook';
import { orderbook } from './orderbook.operator';

describe('orderbook', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  test('should pipe an orderbook on subscription', done => {
    const state = new State();
    state.orderbook.upsert(new Orderbook(instrument));

    new Subject<Component>().pipe(orderbook(instrument, state)).subscribe({
      next: it => {
        expect(it.id).toEqual(instrument.id);
        done();
      }
    });
  });
});
