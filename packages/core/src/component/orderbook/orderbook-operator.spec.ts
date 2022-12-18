import { Subject } from 'rxjs';

import {
  Asset,
  Commission,
  Component,
  Instrument,
  Orderbook,
  orderbook
} from '@lib/component';
import { d } from '@lib/shared';
import { State } from '@lib/store';

describe(orderbook.name, () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should pipe an orderbook on subscription', done => {
    const state = new State();

    state.orderbook.upsert(
      new Orderbook(
        0,
        instrument,
        { rate: d(2), quantity: d(1), next: undefined },
        { rate: d(1), quantity: d(1), next: undefined }
      )
    );

    new Subject<Component>().pipe(orderbook(instrument, state)).subscribe({
      next: it => {
        expect(it.id).toEqual(instrument.id);
        done();
      }
    });
  });
});
