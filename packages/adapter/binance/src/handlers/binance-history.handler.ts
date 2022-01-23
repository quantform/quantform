import { Candle, AdapterContext, retry, tf, HistoryQuery } from '@quantform/core';
import { instrumentToBinance, timeframeToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceHistoryHandler(
  query: HistoryQuery,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<Candle[]> {
  const instrument = context.snapshot.universe.instrument[query.instrument.toString()];

  const response = await retry<any>(() =>
    binance.endpoint.candlesticks(
      instrumentToBinance(instrument),
      timeframeToBinance(query.timeframe),
      false,
      {
        limit: query.length,
        endTime: tf(context.timestamp, query.timeframe)
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
