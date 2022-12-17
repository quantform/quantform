import { Subject } from 'rxjs';

import { Asset, Commission, Component, Instrument, Trade, trade } from '@lib/domain';
import { d } from '@lib/shared';
import { State } from '@lib/store';

describe(trade.name, () => {
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
