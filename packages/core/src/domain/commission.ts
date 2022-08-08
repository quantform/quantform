import { decimal } from 'src/shared';

export class Commission {
  constructor(readonly makerRate: decimal, readonly takerRate: decimal) {}

  calculateMakerFee(value: decimal) {
    return value.mul(this.makerRate);
  }

  calculateTakerFee(value: decimal) {
    return value.mul(this.takerRate);
  }

  applyMakerFee(value: decimal): decimal {
    return value.minus(this.calculateMakerFee(value));
  }

  applyTakerFee(value: decimal): decimal {
    return value.minus(this.calculateTakerFee(value));
  }
}

export function commissionPercentOf(fees: { maker: decimal; taker: decimal }) {
  return new Commission(fees.maker.div(100.0), fees.taker.div(100.0));
}
