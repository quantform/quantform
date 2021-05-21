import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';
import { ListenerChild, STREAMING_TICK_RECORD } from 'xapi-node';
import {
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeSubscribeRequest,
  Instrument,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';

export class ExchangeXtbSubscribeHandler
  implements ExchangeAdapterHandler<ExchangeSubscribeRequest, void> {
  private listener: ListenerChild;
  private mapper: { [raw: string]: Instrument } = {};

  constructor(private readonly adapter: ExchangeXtbAdapter) {}

  async handle(
    request: ExchangeSubscribeRequest,
    store: Store,
    context: ExchangeAdapterContext
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
    context: ExchangeAdapterContext
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
