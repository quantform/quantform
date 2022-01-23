import { Candle, candledown, AdapterContext, HistoryQuery } from '@quantform/core';
import { XtbAdapter } from '../xtb-adapter';
import { timeframeToXtb } from '../xtb-interop';

export async function XtbHistoryHandler(
  query: HistoryQuery,
  context: AdapterContext,
  xtb: XtbAdapter
): Promise<Candle[]> {
  const instrument = context.snapshot.universe.instrument[query.instrument.toString()];

  const to = xtb.endpoint.serverTime;
  const from = candledown(to - query.timeframe * query.length, query.timeframe);

  const response = await xtb.endpoint.Socket.send.getChartLastRequest(
    timeframeToXtb(query.timeframe),
    from,
    instrument.raw
  );

  const scale = Math.pow(10, response.returnData.digits);
  const candles = response.returnData.rateInfos.map(candle => {
    return new Candle(
      candle.ctm,
      candle.open / scale,
      (candle.close + candle.open) / scale,
      (candle.low + candle.open) / scale,
      (candle.high + candle.open) / scale
    );
  });

  return candles;
}
