import { Asset, Commission } from '../../domain';
import { Instrument, InstrumentSelector } from '../../domain/instrument';
import { timestamp } from '../../shared';
import { event } from '../../shared/topic';
import { State, StateChangeTracker } from '../../store';
import { InnerSet } from '../store-state';
import { StoreEvent } from './store.event';

@event
export class InstrumentPatchEvent implements StoreEvent {
  type = 'instrument-patch';

  constructor(
    readonly timestamp: timestamp,
    readonly base: Asset,
    readonly quote: Asset,
    readonly commission: Commission,
    readonly raw: string,
    readonly leverage?: number
  ) {}
}

export function InstrumentPatchEventHandler(
  event: InstrumentPatchEvent,
  state: State,
  changes: StateChangeTracker
) {
  const selector = new InstrumentSelector(
    event.base.name,
    event.quote.name,
    event.base.adapterName
  );

  const instrument = state.universe.instrument.tryGetOrSet(selector.id, () => {
    state.universe.asset.tryGetOrSet(
      event.base.id,
      () => new Asset(event.base.name, event.base.adapterName, 8)
    );

    state.universe.asset.tryGetOrSet(
      event.quote.id,
      () => new Asset(event.quote.name, event.quote.adapterName, 8)
    );

    state.order.tryGetOrSet(selector.id, () => new InnerSet(selector.id));

    return new Instrument(event.base, event.quote, event.raw);
  });

  instrument.timestamp = event.timestamp;
  instrument.commission = event.commission;

  if (event.leverage) {
    instrument.leverage = event.leverage;
  }

  changes.commit(instrument);
}

@event
export class InstrumentSubscriptionEvent implements StoreEvent {
  type = 'instrument-subscription';

  constructor(
    readonly timestamp: timestamp,
    readonly instrument: InstrumentSelector,
    readonly subscribed: boolean
  ) {}
}

export function InstrumentSubscriptionEventHandler(
  event: InstrumentSubscriptionEvent,
  state: State,
  changes: StateChangeTracker
) {
  const instrument = state.universe.instrument.get(event.instrument.id);
  if (!instrument) {
    throw new Error('invalid instrument');
  }

  if (event.subscribed) {
    state.subscription.instrument.upsert(instrument);
    state.subscription.asset.upsert(state.universe.asset.get(instrument.base.id));
    state.subscription.asset.upsert(state.universe.asset.get(instrument.quote.id));
  }

  changes.commit(instrument);
}
