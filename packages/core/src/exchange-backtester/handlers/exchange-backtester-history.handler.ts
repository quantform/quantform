import { Candle } from '../../domain';
import { Store } from '../../store';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeBacktesterStreamer } from '../exchange-backtester.streamer';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';

export class ExchangeBacktesterHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(
    private readonly adapter: ExchangeAdapter,
    private readonly streamer: ExchangeBacktesterStreamer
  ) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<Candle[]> {
    this.streamer.stop();

    const response = await this.adapter.execute<ExchangeHistoryRequest, Candle[]>(
      request,
      store,
      context
    );

    this.streamer.tryContinue();

    return response;
  }
}
