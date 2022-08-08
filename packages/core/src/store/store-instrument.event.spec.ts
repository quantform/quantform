import { Store } from '..';
import { Asset, Commission } from '../domain';
import { d, now } from '../shared';
import { InstrumentPatchEvent } from './store-instrument.event';

describe('InstrumentPatchEvent', () => {
  test('should patch a store', () => {
    const timestamp = now();
    const store = new Store();
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);

    store.dispatch(
      new InstrumentPatchEvent(timestamp, base, quote, new Commission(d(0), d(0)), '')
    );

    const { universe } = store.snapshot;

    expect(universe.instrument.get('cex:de30-usd').base).toEqual(base);
    expect(universe.instrument.get('cex:de30-usd').quote).toEqual(quote);
    expect(universe.instrument.get('cex:de30-usd').timestamp).toEqual(timestamp);
    expect(universe.instrument.asReadonlyArray().length).toEqual(1);
    expect(universe.asset.asReadonlyArray().length).toEqual(2);
  });
});
