import { Asset, Commission, Instrument, InstrumentSelector } from '../domain';
import { timestamp } from '../shared';
import { State, StateChangeTracker } from '.';
import { assetNotSupportedError, instrumentNotSupportedError } from './error';
import { StoreEvent } from './store-event';
import { InnerSet } from './store-state';

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

      return new Instrument(0, this.base, this.quote, this.raw, Commission.Zero);
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
      throw instrumentNotSupportedError(this.instrument);
    }

    if (this.subscribed) {
      const base = state.universe.asset.get(instrument.base.id);
      if (!base) {
        throw assetNotSupportedError(instrument.base);
      }

      const quote = state.universe.asset.get(instrument.quote.id);
      if (!quote) {
        throw assetNotSupportedError(instrument.quote);
      }

      state.subscription.instrument.upsert(instrument);
      state.subscription.asset.upsert(base);
      state.subscription.asset.upsert(quote);
    }

    changes.commit(instrument);
  }
}
