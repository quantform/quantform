import { Feed } from '../storage';
import { timestamp } from '../common';
import { InstrumentSelector, Order } from '../domain';
import { event } from '../common/topic';

@event
export class AdapterAwakeCommand {
  type = 'awake';
}

@event
export class AdapterDisposeCommand {
  type = 'dispose';
}

@event
export class AdapterAccountCommand {
  type = 'account';
}

@event
export class AdapterSubscribeCommand {
  type = 'subscribe';

  constructor(public instrument: Array<InstrumentSelector>) {}
}

@event
export class AdapterOrderOpenCommand {
  type = 'order-open';

  constructor(readonly order: Order) {}
}

@event
export class AdapterOrderCancelCommand {
  type = 'order-cancel';

  constructor(readonly order: Order) {}
}

@event
export class AdapterHistoryQuery {
  type = 'history';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly timeframe: number,
    readonly length: number
  ) {}
}

@event
export class AdapterImportCommand {
  type = 'import';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly from: timestamp,
    readonly to: timestamp,
    readonly feed: Feed,
    readonly progress: (timestamp: number) => void
  ) {}
}
