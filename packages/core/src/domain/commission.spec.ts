import { d } from '../shared';
import { commissionPercentOf } from './commission';

describe('Commission', () => {
  test('should construct a Commission', () => {
    const sut = commissionPercentOf({
      maker: d(0.1),
      taker: d(0.2)
    });

    expect(sut.makerRate).toEqual(d(0.001));
    expect(sut.takerRate).toEqual(d(0.002));
  });

  test('should calculate a maker fee', () => {
    const sut = commissionPercentOf({
      maker: d(0.1),
      taker: d(0.2)
    });

    expect(sut.calculateMakerFee(d(2000))).toEqual(d(2));
    expect(sut.applyMakerFee(d(2000))).toEqual(d(1998));
  });

  test('should calculate a taker fee', () => {
    const sut = commissionPercentOf({
      maker: d(0.1),
      taker: d(0.2)
    });

    expect(sut.calculateTakerFee(d(2000))).toEqual(d(4));
    expect(sut.applyTakerFee(d(2000))).toEqual(d(1996));
  });
});
