import { Candle } from '../../domain';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { ExchangeBinanceFutureAdapter } from '../exchange-binance-future-adapter';
import {
  binanceFutureTranslateInstrument,
  binanceFutureTranslateTimeframe
} from '../exchange-binance-future-common';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { retry } from '../../common/policy';

export class ExchangeBinanceFutureHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(private readonly binance: ExchangeBinanceFutureAdapter) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
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
