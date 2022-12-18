import { Asset, Commission, InstrumentPatchEvent } from '@lib/component';
import { d, now } from '@lib/shared';
import { Store } from '@lib/store';

describe(InstrumentPatchEvent.name, () => {
  test('should patch a store', () => {
    const timestamp = now();
    const store = new Store();
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);

    store.dispatch(
      new InstrumentPatchEvent(timestamp, base, quote, new Commission(d.Zero, d.Zero), '')
    );

    const { universe } = store.snapshot;
    const instrument = universe.instrument.get('cex:de30-usd') ?? fail();

    expect(instrument.base).toEqual(base);
    expect(instrument.quote).toEqual(quote);
    expect(instrument.timestamp).toEqual(timestamp);
    expect(universe.instrument.asReadonlyArray().length).toEqual(1);
    expect(universe.asset.asReadonlyArray().length).toEqual(2);
  });
});
