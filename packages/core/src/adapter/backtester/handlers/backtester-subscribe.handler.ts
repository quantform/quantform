import { AdapterHandler } from '../..';
import { AdapterSubscribeRequest } from '../../adapter-request';
import { BacktesterStreamer } from '../backtester-streamer';

export class BacktesterSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly streamer: BacktesterStreamer) {}

  async handle(request: AdapterSubscribeRequest): Promise<void> {
    request.instrument.forEach(it => {
      this.streamer.subscribe(it);
    });
  }
}
