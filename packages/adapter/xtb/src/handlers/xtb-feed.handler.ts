import { XtbAdapter } from '../xtb-adapter';
import { PERIOD_FIELD } from 'xapi-node';
import {
  AdapterContext,
  AdapterFeedCommand,
  Instrument,
  OrderbookPatchEvent,
  Timeframe
} from '@quantform/core';

export async function XtbFeedHandler(
  command: AdapterFeedCommand,
  context: AdapterContext,
  xtb: XtbAdapter
) {
  const instrument =
    context.store.snapshot.universe.instrument[command.instrument.toString()];

  const response = await xtb.endpoint.Socket.send.getChartRangeRequest(
    command.to - Timeframe.M1,
    PERIOD_FIELD.PERIOD_M1,
    command.from - Timeframe.M1,
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
    await command.feed.save(instrument, [
      mapInstrument(instrument, candle[0] + Timeframe.S1 * 0, candle[1]),
      mapInstrument(instrument, candle[0] + Timeframe.S1 * 15, candle[2]),
      mapInstrument(instrument, candle[0] + Timeframe.S1 * 30, candle[3]),
      mapInstrument(instrument, candle[0] + Timeframe.S1 * 45, candle[4])
    ]);
  }
}

function mapInstrument(instrument: Instrument, timestamp: number, value: number) {
  return new OrderbookPatchEvent(
    instrument,
    value + instrument.quote.tickSize,
    0,
    value - instrument.quote.tickSize,
    0,
    timestamp
  );
}
