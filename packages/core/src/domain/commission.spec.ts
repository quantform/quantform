import decimal from 'decimal.js';

import { commissionPercentOf } from './commission';

describe('Commission', () => {
  test('should construct a Commission', () => {
    const sut = commissionPercentOf({
      maker: new decimal(0.1),
      taker: new decimal(0.2)
    });

    expect(sut.makerRate).toEqual(new decimal(0.001));
    expect(sut.takerRate).toEqual(new decimal(0.002));
  });

  test('should calculate a maker fee', () => {
    const sut = commissionPercentOf({
      maker: new decimal(0.1),
      taker: new decimal(0.2)
    });

    expect(sut.calculateMakerFee(new decimal(2000))).toEqual(new decimal(2));
    expect(sut.applyMakerFee(new decimal(2000))).toEqual(new decimal(1998));
  });

  test('should calculate a taker fee', () => {
    const sut = commissionPercentOf({
      maker: new decimal(0.1),
      taker: new decimal(0.2)
    });

    expect(sut.calculateTakerFee(new decimal(2000))).toEqual(new decimal(4));
    expect(sut.applyTakerFee(new decimal(2000))).toEqual(new decimal(1996));
  });
});
