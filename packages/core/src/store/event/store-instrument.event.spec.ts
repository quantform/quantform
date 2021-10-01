import { Store } from '..';
import { now } from '../../common';
import { Asset, Commision } from '../../domain';
import { InstrumentPatchEvent } from './store-instrument.event';

describe('instrument patch event tests', () => {
  test('should patch a store', () => {
    const timestamp = now();
    const store = new Store();
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);

    store.dispatch(
      new InstrumentPatchEvent(timestamp, base, quote, new Commision(0, 0), '')
    );

    expect(store.snapshot.universe.instrument['cex:de30-usd'].base).toEqual(base);
    expect(store.snapshot.universe.instrument['cex:de30-usd'].quote).toEqual(quote);
    expect(store.snapshot.universe.instrument['cex:de30-usd'].timestamp).toEqual(
      timestamp
    );
    expect(Object.keys(store.snapshot.universe.instrument).length).toEqual(1);
    expect(Object.keys(store.snapshot.universe.asset).length).toEqual(2);
  });
});
