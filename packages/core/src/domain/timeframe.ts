export class Timeframe {
  static S1 = 1000;
  static M1 = Timeframe.S1 * 60;
  static M5 = Timeframe.M1 * 5;
  static M15 = Timeframe.M5 * 3;
  static M30 = Timeframe.M15 * 2;
  static H1 = Timeframe.M30 * 2;
  static H4 = Timeframe.H1 * 4;
  static H6 = Timeframe.H1 * 6;
  static H12 = Timeframe.H6 * 2;
  static D1 = Timeframe.H12 * 2;
  static W1 = Timeframe.D1 * 7;
}

export function tf(timestamp: number, timeframe: number): number {
  return timestamp - (timestamp % timeframe);
}
