import { Asset, Commission, InstrumentSelector, Instrument } from '../domain';
import { timestamp } from '../shared';
import { State, StateChangeTracker } from '../store';
import { InnerSet } from './store-state';
import { StoreEvent } from './store.event';

export class InstrumentPatchEvent implements StoreEvent {
  constructor(
    readonly timestamp: timestamp,
    readonly base: Asset,
    readonly quote: Asset,
    readonly commission: Commission,
    readonly raw: string,
    readonly leverage?: number
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const selector = new InstrumentSelector(
      this.base.name,
      this.quote.name,
      this.base.adapterName
    );

    const instrument = state.universe.instrument.tryGetOrSet(selector.id, () => {
      state.universe.asset.tryGetOrSet(
        this.base.id,
        () => new Asset(this.base.name, this.base.adapterName, 8)
      );

      state.universe.asset.tryGetOrSet(
        this.quote.id,
        () => new Asset(this.quote.name, this.quote.adapterName, 8)
      );

      state.order.tryGetOrSet(selector.id, () => new InnerSet(selector.id));

      return new Instrument(this.base, this.quote, this.raw);
    });

    instrument.timestamp = this.timestamp;
    instrument.commission = this.commission;

    if (this.leverage) {
      instrument.leverage = this.leverage;
    }

    changes.commit(instrument);
  }
}

export class InstrumentSubscriptionEvent implements StoreEvent {
  constructor(
    readonly timestamp: timestamp,
    readonly instrument: InstrumentSelector,
    readonly subscribed: boolean
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const instrument = state.universe.instrument.get(this.instrument.id);
    if (!instrument) {
      throw new Error('invalid instrument');
    }

    if (this.subscribed) {
      state.subscription.instrument.upsert(instrument);
      state.subscription.asset.upsert(state.universe.asset.get(instrument.base.id));
      state.subscription.asset.upsert(state.universe.asset.get(instrument.quote.id));
    }

    changes.commit(instrument);
  }
}
