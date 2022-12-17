import { Asset, Commission } from '@lib/domain';
import { BalanceLoadEvent, InstrumentPatchEvent } from '@lib/domain';
import { d, now } from '@lib/shared';
import { Store } from '@lib/store';

describe(BalanceLoadEvent.name, () => {
  test('should patch a store', () => {
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);
    const timestamp = now();
    const store = new Store();
    let component;

    store.changes$.subscribe(it => (component = it));

    store.dispatch(
      new InstrumentPatchEvent(timestamp, base, quote, new Commission(d.Zero, d.Zero), '')
    );
    store.dispatch(new BalanceLoadEvent(base, d(100), d.Zero, timestamp));

    const balance = store.snapshot.balance.get(base.id) ?? fail();

    expect(balance).toEqual(component);
    expect(balance.free).toEqual(d(100));
    expect(balance.locked).toEqual(d.Zero);
    expect(balance.timestamp).toEqual(timestamp);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
