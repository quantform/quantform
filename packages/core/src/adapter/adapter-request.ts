import { Feed } from '../feed';
import { timestamp } from '../common';
import { Candle, Instrument, InstrumentSelector, Order } from '../domain';

export class AdapterRequest<T> {
  constructor(readonly typeName: string) {}
}

export class AdapterAwakeRequest extends AdapterRequest<void> {
  constructor() {
    super(AdapterAwakeRequest.name);
  }
}

export class AdapterDisposeRequest extends AdapterRequest<void> {
  constructor() {
    super(AdapterDisposeRequest.name);
  }
}

export class AdapterAccountRequest extends AdapterRequest<void> {
  constructor() {
    super(AdapterAccountRequest.name);
  }
}

export class AdapterSubscribeRequest extends AdapterRequest<void> {
  constructor(readonly instrument: Array<Instrument>) {
    super(AdapterSubscribeRequest.name);
  }
}

export class AdapterOrderOpenRequest extends AdapterRequest<void> {
  constructor(readonly order: Order) {
    super(AdapterOrderOpenRequest.name);
  }
}

export class AdapterOrderCancelRequest extends AdapterRequest<void> {
  constructor(readonly order: Order) {
    super(AdapterOrderCancelRequest.name);
  }
}

export class AdapterHistoryRequest extends AdapterRequest<Candle[]> {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly timeframe: number,
    readonly length: number
  ) {
    super(AdapterHistoryRequest.name);
  }
}

export class AdapterImportRequest extends AdapterRequest<void> {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly from: timestamp,
    readonly to: timestamp,
    readonly feed: Feed
  ) {
    super(AdapterImportRequest.name);
  }
}