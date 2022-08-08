import { decimal, timestamp } from '../shared';

export class Candle {
  constructor(
    public timestamp: timestamp,
    public open: decimal,
    public high: decimal,
    public low: decimal,
    public close: decimal,
    public volume?: decimal
  ) {}

  apply(value: decimal) {
    this.high = decimal.max(this.high, value);
    this.low = decimal.min(this.low, value);
    this.close = value;
  }
}
