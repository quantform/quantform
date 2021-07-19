import { now } from '../../common';
import { Asset, Commision } from '../../domain';
import { State } from '../store.state';
import { InstrumentPatchEvent } from './store-instrument.event';

describe('instrument patch event tests', () => {
  test('should patch a store', () => {
    const timestamp = now();
    const state = new State();
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);

    const event = new InstrumentPatchEvent(
      timestamp,
      base,
      quote,
      new Commision(0, 0),
      ''
    );

    event.execute(state);

    expect(state.universe.instrument['cex:de30-usd'].base).toEqual(base);
    expect(state.universe.instrument['cex:de30-usd'].quote).toEqual(quote);
    expect(state.universe.instrument['cex:de30-usd'].timestamp).toEqual(timestamp);
    expect(Object.keys(state.universe.instrument).length).toEqual(1);
    expect(Object.keys(state.universe.asset).length).toEqual(2);
  });
});
