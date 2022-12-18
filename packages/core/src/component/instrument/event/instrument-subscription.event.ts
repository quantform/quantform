import { InstrumentSelector } from '@lib/component';
import { timestamp } from '@lib/shared';
import {
  AssetNotSupportedError,
  InstrumentNotSupportedError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class InstrumentSubscriptionEvent implements StoreEvent {
  constructor(
    readonly timestamp: timestamp,
    readonly instrument: InstrumentSelector,
    readonly subscribed: boolean
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const instrument = state.universe.instrument.get(this.instrument.id);
    if (!instrument) {
      throw new InstrumentNotSupportedError(this.instrument);
    }

    if (this.subscribed) {
      const base = state.universe.asset.get(instrument.base.id);
      if (!base) {
        throw new AssetNotSupportedError(instrument.base);
      }

      const quote = state.universe.asset.get(instrument.quote.id);
      if (!quote) {
        throw new AssetNotSupportedError(instrument.quote);
      }

      state.subscription.instrument.upsert(instrument);
      state.subscription.asset.upsert(base);
      state.subscription.asset.upsert(quote);
    }

    changes.commit(instrument);
  }
}
