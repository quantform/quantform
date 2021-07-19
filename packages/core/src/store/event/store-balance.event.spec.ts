import { Asset, Commision } from '../../domain';
import { BalancePatchEvent } from '.';
import { State } from '../store.state';
import { InstrumentPatchEvent } from './store-instrument.event';
import { now } from '../../common';

describe('balance patch event tests', () => {
  test('should patch a store', () => {
    const base = new Asset('de30', 'cex', 2);
    const quote = new Asset('usd', 'cex', 2);
    const timestamp = now();
    const state = new State();

    new InstrumentPatchEvent(timestamp, base, quote, new Commision(0, 0), '').execute(
      state
    );

    const event = new BalancePatchEvent(base, 100, 0, timestamp);
    const dirtable = event.execute(state);
    const balance = state.balance[base.toString()];

    expect(balance).toEqual(dirtable);
    expect(balance.free).toEqual(100);
    expect(balance.freezed).toEqual(0);
    expect(balance.timestamp).toEqual(timestamp);
  });
});
