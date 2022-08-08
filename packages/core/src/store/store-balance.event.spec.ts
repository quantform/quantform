import { Asset, Commission } from '../domain';
import { d, now } from '../shared';
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
      new InstrumentPatchEvent(timestamp, base, quote, new Commission(d(0), d(0)), '')
    );
    store.dispatch(new BalancePatchEvent(base, d(100), d(0), timestamp));

    const balance = store.snapshot.balance.get(base.id);

    expect(balance).toEqual(component);
    expect(balance.free).toEqual(d(100));
    expect(balance.locked).toEqual(d(0));
    expect(balance.timestamp).toEqual(timestamp);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
