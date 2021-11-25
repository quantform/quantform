import { Asset, Commission } from '../../domain';
import { BalancePatchEvent } from '.';
import { InstrumentPatchEvent } from './store-instrument.event';
import { now } from '../../shared';
import { Store } from '..';

describe('balance event tests', () => {
  test('should patch a store', () => {
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);
    const timestamp = now();
    const store = new Store();
    let component;

    store.changes$.subscribe(it => (component = it));

    store.dispatch(
      new InstrumentPatchEvent(timestamp, base, quote, new Commission(0, 0), '')
    );
    store.dispatch(new BalancePatchEvent(base, 100, 0, timestamp));

    const balance = store.snapshot.balance[base.toString()];

    expect(balance).toEqual(component);
    expect(balance.free).toEqual(100);
    expect(balance.freezed).toEqual(0);
    expect(balance.timestamp).toEqual(timestamp);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
