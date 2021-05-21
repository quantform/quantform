import { Feed } from '../feed';
import { timestamp } from '../common';
import { Candle, Instrument, InstrumentSelector, Order } from '../domain';

export class ExchangeAdapterRequest<T> {
  constructor(readonly typeName: string) {}
}

export class ExchangeAwakeRequest extends ExchangeAdapterRequest<void> {
  constructor() {
    super(ExchangeAwakeRequest.name);
  }
}

export class ExchangeDisposeRequest extends ExchangeAdapterRequest<void> {
  constructor() {
    super(ExchangeDisposeRequest.name);
  }
}

export class ExchangeAccountRequest extends ExchangeAdapterRequest<void> {
  constructor() {
    super(ExchangeAccountRequest.name);
  }
}

export class ExchangeSubscribeRequest extends ExchangeAdapterRequest<void> {
  constructor(readonly instrument: Array<Instrument>) {
    super(ExchangeSubscribeRequest.name);
  }
}

export class ExchangeOrderOpenRequest extends ExchangeAdapterRequest<void> {
  constructor(readonly order: Order) {
    super(ExchangeOrderOpenRequest.name);
  }
}

export class ExchangeOrderCancelRequest extends ExchangeAdapterRequest<void> {
  constructor(readonly order: Order) {
    super(ExchangeOrderCancelRequest.name);
  }
}

export class ExchangeHistoryRequest extends ExchangeAdapterRequest<Candle[]> {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly timeframe: number,
    readonly length: number
  ) {
    super(ExchangeHistoryRequest.name);
  }
}

export class ExchangeImportRequest extends ExchangeAdapterRequest<void> {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly from: timestamp,
    readonly to: timestamp,
    readonly feed: Feed
  ) {
    super(ExchangeImportRequest.name);
  }
}
