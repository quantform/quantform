import { TimeframeType } from 'dukascopy-node';
import { Timeframe } from '@quantform/core';

export function timeframeToDukascopy(timeframe: number): Exclude<TimeframeType, 'tick'> {
  switch (timeframe) {
    case Timeframe.M1:
      return 'm1';
    case Timeframe.M15:
      return 'm15';
    case Timeframe.M30:
      return 'm30';
    case Timeframe.H1:
      return 'h1';
    case Timeframe.D1:
      return 'd1';
  }

  throw new Error(`unsupported timeframe: ${timeframe}`);
}
