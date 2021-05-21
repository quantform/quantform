import { Candle } from '../../domain';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';
import { xtbTranslateTimeframe } from '../exchange-xtb.common';
import { candledown } from '../../common';

export class ExchangeXtbHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(private readonly xtb: ExchangeXtbAdapter) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
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
