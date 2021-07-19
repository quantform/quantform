import { XtbAdapter } from '../xtb-adapter';
import { ListenerChild, STREAMING_TICK_RECORD } from 'xapi-node';
import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  Instrument,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';

export class XtbSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  private listener: ListenerChild;
  private mapper: { [raw: string]: Instrument } = {};

  constructor(private readonly adapter: XtbAdapter) {}

  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    if (!this.listener) {
      this.listener = this.adapter.endpoint.Stream.listen.getTickPrices(tick =>
        this.onUpdate(tick, store, context)
      );
    }

    for (const instrument of request.instrument) {
      this.mapper[instrument.raw] = instrument;

      await this.adapter.endpoint.Stream.subscribe
        .getTickPrices(instrument.raw)
        .catch(() => {
          console.error('subscribe failed');
        });
    }
  }

  private onUpdate(
    tick: STREAMING_TICK_RECORD,
    store: Store,
    context: AdapterContext
  ): void {
    if (tick.level != 0) {
      return;
    }

    const instrument = this.mapper[tick.symbol];

    store.dispatch(
      new OrderbookPatchEvent(
        instrument,
        tick.ask,
        tick.askVolume,
        tick.bid,
        tick.bidVolume,
        context.timestamp()
      )
    );
  }
}
