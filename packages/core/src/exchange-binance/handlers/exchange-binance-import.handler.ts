import { Timeframe } from '../../domain';
import { ExchangeImportRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { ExchangeBinanceAdapter } from '..';
import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { CandleEvent } from '../../store/event/store-candle.event';
import { now } from '../../common';
import { retry } from '../../common/policy';
import { ipcFeedNotify } from '../../ipc';

export class ExchangeBinanceImportHandler
  implements ExchangeAdapterHandler<ExchangeImportRequest, void> {
  constructor(private readonly binance: ExchangeBinanceAdapter) {}

  async handle(request: ExchangeImportRequest, store: Store): Promise<void> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const count = 1000;
    const to = Math.min(request.to, now());
    let from = request.from;

    while (from < to) {
      const response = await retry<any>(() =>
        this.binance.endpoint.candlesticks(
          this.binance.translateInstrument(instrument),
          this.binance.translateTimeframe(Timeframe.M1),
          false,
          {
            limit: count,
            startTime: from,
            endTime: to
          }
        )
      );

      if (!response.length) {
        break;
      }

      await request.feed.write(
        instrument,
        response.map(
          it =>
            new CandleEvent(
              instrument,
              Timeframe.M1,
              parseFloat(it[1]),
              parseFloat(it[2]),
              parseFloat(it[3]),
              parseFloat(it[4]),
              0,
              it[0]
            )
        )
      );

      from = response[response.length - 1][0] + 1;

      ipcFeedNotify(request.from, to, from);

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
