import {
  CandleEvent,
  AdapterHandler,
  AdapterImportRequest,
  Instrument,
  now,
  OrderbookPatchEvent,
  retry,
  Store,
  Timeframe
} from '@quantform/core';
import { ExchangeBinanceFutureAdapter } from '..';
import {
  binanceFutureTranslateInstrument,
  binanceFutureTranslateTimeframe
} from '../exchange-binance-future-common';

export class ExchangeBinanceFutureImportHandler
  implements AdapterHandler<AdapterImportRequest, void> {
  constructor(private readonly binance: ExchangeBinanceFutureAdapter) {}

  async handle(request: AdapterImportRequest, store: Store): Promise<void> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const count = 1000;
    const to = Math.min(request.to, now());
    let from = request.from;

    while (from < to) {
      const response = await retry<any>(() =>
        this.binance.endpoint.candlesticks(
          binanceFutureTranslateInstrument(instrument),
          binanceFutureTranslateTimeframe(Timeframe.M1),
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

      //ipcFeedNotify(request.from, to, from);

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  private write(instrument: Instrument, timestamp: number, value: number) {
    const event = new OrderbookPatchEvent(
      instrument,
      value + instrument.quote.tickSize,
      0,
      value - instrument.quote.tickSize,
      0,
      timestamp
    );

    return event;
  }
}
