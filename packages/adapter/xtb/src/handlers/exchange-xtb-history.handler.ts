import {
  Candle,
  candledown,
  AdapterContext,
  AdapterHandler,
  AdapterHistoryRequest,
  Store
} from '@quantform/core';
import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';
import { xtbTranslateTimeframe } from '../exchange-xtb.common';

export class ExchangeXtbHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(private readonly xtb: ExchangeXtbAdapter) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
  ): Promise<Candle[]> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const to = this.xtb.endpoint.serverTime;
    const from = candledown(to - request.timeframe * request.length, request.timeframe);

    const response = await this.xtb.endpoint.Socket.send.getChartLastRequest(
      xtbTranslateTimeframe(request.timeframe),
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
}
