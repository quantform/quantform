import { Candle, AdapterContext, AdapterHistoryQuery, retry } from '@quantform/core';
import { instrumentToBinance, timeframeToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceHistoryHandler(
  command: AdapterHistoryQuery,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<Candle[]> {
  const instrument =
    context.store.snapshot.universe.instrument[command.instrument.toString()];

  const response = await retry<any>(() =>
    binance.endpoint.candlesticks(
      instrumentToBinance(instrument),
      timeframeToBinance(command.timeframe),
      false,
      {
        limit: command.length,
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
