import { Candle } from '../../domain';
import { Store } from '../../store';
import { ExchangeDukascopyAdapter } from '../exchange-dukascopy-adapter';
import { getHistoricRates, Instrument } from 'dukascopy-node';
import { dukascopyTranslateTimeframe } from '../exchange-dukascopy-common';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { retry } from '../../common/policy';

export class ExchangeDukascopyHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(private readonly dukascopy: ExchangeDukascopyAdapter) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<Candle[]> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const history = await retry<any>(() =>
      getHistoricRates({
        instrument: Instrument[instrument.raw as keyof typeof Instrument],
        dates: {
          from: new Date(
            context.timestamp() - request.timeframe * request.length
          ).toISOString(),
          to: new Date(context.timestamp()).toISOString()
        },
        timeframe: dukascopyTranslateTimeframe(request.timeframe),
        format: 'json'
      })
    );

    return history.map(
      it => new Candle(it.timestamp, it.open, it.high, it.low, it.close)
    );
  }
}
