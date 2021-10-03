import { InstrumentSelector, Timeframe } from '@quantform/core';

export function translateInstrument(instrument: InstrumentSelector): string {
  return `${instrument.base.name.toUpperCase()}${instrument.quote.name.toUpperCase()}`;
}

export function translateTimeframe(timeframe: number): string {
  switch (timeframe) {
    case Timeframe.M1:
      return '1m';
    case Timeframe.M5:
      return '5m';
    case Timeframe.M15:
      return '15m';
    case Timeframe.M30:
      return '30m';
    case Timeframe.H1:
      return '1h';
    case Timeframe.H6:
      return 'h6';
    case Timeframe.H12:
      return '12h';
    case Timeframe.D1:
      return '1d';
  }

  throw new Error(`unsupported timeframe: ${timeframe}`);
}
