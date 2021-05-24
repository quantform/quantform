import { ExchangeDukascopyAdapter } from '../exchange-dukascopy-adapter';
import { getHistoricRates, Instrument } from 'dukascopy-node';
import { dukascopyTranslateTimeframe } from '../exchange-dukascopy-common';
import {
  Candle,
  AdapterContext,
  AdapterHandler,
  AdapterHistoryRequest,
  retry,
  Store
} from '@quantform/core';

export class ExchangeDukascopyHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(private readonly dukascopy: ExchangeDukascopyAdapter) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
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
