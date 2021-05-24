import { Candle } from '../../../domain';
import { Store } from '../../../store';
import { Adapter } from '../../adapter';
import { AdapterHistoryRequest } from '../../adapter-request';
import { BacktesterStreamer } from '../backtester-streamer';
import { AdapterContext, AdapterHandler } from '../..';

export class BacktesterHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(
    private readonly adapter: Adapter,
    private readonly streamer: BacktesterStreamer
  ) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
  ): Promise<Candle[]> {
    this.streamer.stop();

    const response = await this.adapter.execute<AdapterHistoryRequest, Candle[]>(
      request,
      store,
      context
    );

    this.streamer.tryContinue();

    return response;
  }
}
