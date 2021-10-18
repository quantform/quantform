import { Candle, AdapterContext, retry, AdapterHistoryQuery } from '@quantform/core';
import { BinanceFutureAdapter } from '../binance-future-adapter';
import {
  instrumentToBinanceFuture,
  timeframeToBinanceFuture
} from '../binance-future-interop';

export async function BinanceFutureHistoryHandler(
  query: AdapterHistoryQuery,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<Candle[]> {
  const instrument =
    context.store.snapshot.universe.instrument[query.instrument.toString()];

  const response = await retry<any>(() =>
    binanceFuture.endpoint.futuresCandles(
      instrumentToBinanceFuture(instrument),
      timeframeToBinanceFuture(query.timeframe),
      {
        limit: query.length,
        endTime: context.timestamp
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
