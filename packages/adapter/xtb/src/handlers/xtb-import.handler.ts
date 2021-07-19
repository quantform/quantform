import { XtbAdapter } from '../xtb-adapter';
import { PERIOD_FIELD } from 'xapi-node';
import {
  AdapterHandler,
  AdapterImportRequest,
  Instrument,
  OrderbookPatchEvent,
  Store,
  Timeframe
} from '@quantform/core';

export class XtbImportHandler implements AdapterHandler<AdapterImportRequest, void> {
  constructor(private readonly xtb: XtbAdapter) {}

  async handle(request: AdapterImportRequest, store: Store): Promise<void> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const response = await this.xtb.endpoint.Socket.send.getChartRangeRequest(
      request.to - Timeframe.M1,
      PERIOD_FIELD.PERIOD_M1,
      request.from - Timeframe.M1,
      instrument.raw
    );

    const scale = Math.pow(10, response.returnData.digits);
    const candles = response.returnData.rateInfos.map(candle => {
      return [
        candle.ctm,
        candle.open / scale,
        (candle.close + candle.open) / scale,
        (candle.low + candle.open) / scale,
        (candle.high + candle.open) / scale,
        candle.vol
      ];
    });

    for (const candle of candles) {
      await request.feed.write(instrument, [
        this.map(instrument, candle[0] + Timeframe.S1 * 0, candle[1]),
        this.map(instrument, candle[0] + Timeframe.S1 * 15, candle[2]),
        this.map(instrument, candle[0] + Timeframe.S1 * 30, candle[3]),
        this.map(instrument, candle[0] + Timeframe.S1 * 45, candle[4])
      ]);
    }
  }

  private map(instrument: Instrument, timestamp: number, value: number) {
    return new OrderbookPatchEvent(
      instrument,
      value + instrument.quote.tickSize,
      0,
      value - instrument.quote.tickSize,
      0,
      timestamp
    );
  }
}
