import {
  Timeframe,
  CandleEvent,
  retry,
  AdapterFeedCommand,
  AdapterContext
} from '@quantform/core';
import { instrumentToBinance, timeframeToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance-adapter';

export async function BinanceFeedHandler(
  command: AdapterFeedCommand,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  const instrument =
    context.store.snapshot.universe.instrument[command.instrument.toString()];

  const count = 1000;
  const to = command.to;
  let from = command.from;

  while (from < to) {
    const response = await retry<any>(() =>
      binance.endpoint.candlesticks(
        instrumentToBinance(instrument),
        timeframeToBinance(Timeframe.M1),
        false,
        {
          limit: count,
          startTime: from,
          endTime: to
        }
      )
    );

    if (!response.length) {
      break;
    }

    await command.feed.write(
      instrument,
      response.map(
        it =>
          new CandleEvent(
            instrument,
            Timeframe.M1,
            parseFloat(it[1]),
            parseFloat(it[2]),
            parseFloat(it[3]),
            parseFloat(it[4]),
            0,
            it[0]
          )
      )
    );

    from = response[response.length - 1][0] + 1;

    command.progress(from);

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
