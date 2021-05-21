import { Candle } from '../../domain';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { ExchangeBinanceAdapter } from '..';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { retry } from '../../common/policy';

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
