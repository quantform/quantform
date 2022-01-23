import { DukascopyAdapter } from '../dukascopy.adapter';
import { getHistoricRates, Instrument } from 'dukascopy-node';
import { timeframeToDukascopy } from '../dukascopy-interop';
import { Candle, AdapterContext, retry, HistoryQuery } from '@quantform/core';

export async function DukascopyHistoryHandler(
  query: HistoryQuery,
  context: AdapterContext,
  dukascopy: DukascopyAdapter
): Promise<Candle[]> {
  const instrument = context.snapshot.universe.instrument[query.instrument.toString()];

  const history = await retry<any>(() =>
    getHistoricRates({
      instrument: Instrument[instrument.raw as keyof typeof Instrument],
      dates: {
        from: new Date(context.timestamp - query.timeframe * query.length).toISOString(),
        to: new Date(context.timestamp).toISOString()
      },
      timeframe: timeframeToDukascopy(query.timeframe),
      format: 'json'
    })
  );

  return history.map(it => new Candle(it.timestamp, it.open, it.high, it.low, it.close));
}
