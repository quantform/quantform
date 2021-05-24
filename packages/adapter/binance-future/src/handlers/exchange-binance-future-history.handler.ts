import {
  Candle,
  AdapterContext,
  AdapterHandler,
  AdapterHistoryRequest,
  retry,
  Store
} from '@quantform/core';
import { ExchangeBinanceFutureAdapter } from '../exchange-binance-future-adapter';
import {
  binanceFutureTranslateInstrument,
  binanceFutureTranslateTimeframe
} from '../exchange-binance-future-common';

export class ExchangeBinanceFutureHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(private readonly binance: ExchangeBinanceFutureAdapter) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
  ): Promise<Candle[]> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const response = await retry<any>(() =>
      this.binance.endpoint.futuresCandles(
        binanceFutureTranslateInstrument(instrument),
        binanceFutureTranslateTimeframe(request.timeframe),
        {
          limit: request.length,
          endTime: context.timestamp()
        }
      )
    );

    return response.map(
      it =>
        new Candle(
          it[0],
          parseFloat(it[1]),
          parseFloat(it[2]),
          parseFloat(it[3]),
          parseFloat(it[4])
        )
    );
  }
}
