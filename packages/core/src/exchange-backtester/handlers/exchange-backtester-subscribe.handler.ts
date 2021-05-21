import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeSubscribeRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeBacktesterStreamer } from '../exchange-backtester.streamer';

export class ExchangeBacktesterSubscribeHandler
  implements ExchangeAdapterHandler<ExchangeSubscribeRequest, void> {
  constructor(private readonly streamer: ExchangeBacktesterStreamer) {}

  async handle(request: ExchangeSubscribeRequest): Promise<void> {
    request.instrument.forEach(it => {
      this.streamer.subscribe(it);
    });
  }
}
