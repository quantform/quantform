import { InstrumentSelector, Timeframe } from '../domain';

export function binanceFutureTranslateInstrument(asset: InstrumentSelector): string {
  return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
}

export function binanceFutureTranslateTimeframe(timeframe: number): string {
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
      return '6h';
    case Timeframe.H12:
      return '12h';
    case Timeframe.D1:
      return '1d';
  }

  throw new Error(`unsupported timeframe: ${timeframe}`);
}
