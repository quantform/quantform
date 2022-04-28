export class Commission {
  constructor(readonly makerRate: number, readonly takerRate: number) {}

  calculateMakerFee(value: number) {
    return value * this.makerRate;
  }

  calculateTakerFee(value: number) {
    return value * this.takerRate;
  }

  applyMakerFee(value: number): number {
    return value - this.calculateMakerFee(value);
  }

  applyTakerFee(value: number): number {
    return value - this.calculateTakerFee(value);
  }
}

export function commissionPercentOf(fees: { maker: number; taker: number }) {
  return new Commission(fees.maker / 100.0, fees.taker / 100.0);
}
