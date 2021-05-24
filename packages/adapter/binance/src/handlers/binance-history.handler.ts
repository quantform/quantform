import {
  Candle,
  AdapterContext,
  AdapterHandler,
  AdapterHistoryRequest,
  retry,
  Store
} from '@quantform/core';
import { BinanceAdapter } from '../binance-adapter';

export class BinanceHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(private readonly binance: BinanceAdapter) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
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
