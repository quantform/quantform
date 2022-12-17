import { Asset, Commission, Instrument, InstrumentSelector } from '@lib/domain';
import { timestamp } from '@lib/shared';
import { InnerSet, State, StateChangeTracker, StoreEvent } from '@lib/store';

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
