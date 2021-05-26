import {
  Timeframe,
  AdapterImportRequest,
  Store,
  AdapterHandler,
  CandleEvent,
  retry
} from '@quantform/core';
import { BinanceAdapter } from '../binance-adapter';

export class BinanceImportHandler implements AdapterHandler<AdapterImportRequest, void> {
  constructor(private readonly binance: BinanceAdapter) {}

  async handle(request: AdapterImportRequest, store: Store): Promise<void> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const count = 1000;
    const to = request.to;
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

      request.progress(from);

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
