import {
  Candle,
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeHistoryRequest,
  retry,
  Store
} from '@quantform/core';
import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';

export class ExchangeBinanceHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(private readonly binance: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<Candle[]> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const response = await retry<any>(() =>
      this.binance.endpoint.candlesticks(
        this.binance.translateInstrument(instrument),
        this.binance.translateTimeframe(request.timeframe),
        false,
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
