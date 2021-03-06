import { timestamp } from '../shared';

export class Candle {
  constructor(
    public timestamp: timestamp,
    public open: number,
    public high: number,
    public low: number,
    public close: number,
    public volume?: number
  ) {}

  apply(value: number) {
    this.high = Math.max(this.high, value);
    this.low = Math.min(this.low, value);
    this.close = value;
  }
}
