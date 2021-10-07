import { Timeframe } from '@quantform/core';
import { PERIOD_FIELD } from 'xapi-node';

export function timeframeToXtb(timeframe: Timeframe) {
  switch (timeframe) {
    case Timeframe.M1:
      return PERIOD_FIELD.PERIOD_M1;
    case Timeframe.M5:
      return PERIOD_FIELD.PERIOD_M5;
    case Timeframe.M15:
      return PERIOD_FIELD.PERIOD_M15;
    case Timeframe.M30:
      return PERIOD_FIELD.PERIOD_M30;
    case Timeframe.H1:
      return PERIOD_FIELD.PERIOD_H1;
    case Timeframe.H4:
      return PERIOD_FIELD.PERIOD_H4;
    case Timeframe.D1:
      return PERIOD_FIELD.PERIOD_D1;
    case Timeframe.W1:
      return PERIOD_FIELD.PERIOD_W1;
    default:
      throw Error(`timeframe ${timeframe} not supported`);
  }
}
