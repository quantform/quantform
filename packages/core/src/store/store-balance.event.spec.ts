import { Asset, Commission } from '../domain';
import { decimal, now } from '../shared';
import { Store } from '.';
import { BalancePatchEvent } from './store-balance.event';
import { InstrumentPatchEvent } from './store-instrument.event';

describe('BalancePatchEvent', () => {
  test('should patch a store', () => {
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);
    const timestamp = now();
    const store = new Store();
    let component;

    store.changes$.subscribe(it => (component = it));

    store.dispatch(
      new InstrumentPatchEvent(
        timestamp,
        base,
        quote,
        new Commission(new decimal(0), new decimal(0)),
        ''
      )
    );
    store.dispatch(
      new BalancePatchEvent(base, new decimal(100), new decimal(0), timestamp)
    );

    const balance = store.snapshot.balance.get(base.id);

    expect(balance).toEqual(component);
    expect(balance.free).toEqual(new decimal(100));
    expect(balance.locked).toEqual(new decimal(0));
    expect(balance.timestamp).toEqual(timestamp);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
