import { commissionPercentOf } from './commission';

describe('Commission', () => {
  test('should construct a Commission', () => {
    const sut = commissionPercentOf({
      maker: 0.1,
      taker: 0.2
    });

    expect(sut.makerRate).toEqual(0.001);
    expect(sut.takerRate).toEqual(0.002);
  });

  test('should calculate a maker fee', () => {
    const sut = commissionPercentOf({
      maker: 0.1,
      taker: 0.2
    });

    expect(sut.calculateMakerFee(2000)).toEqual(2);
    expect(sut.applyMakerFee(2000)).toEqual(1998);
  });

  test('should calculate a taker fee', () => {
    const sut = commissionPercentOf({
      maker: 0.1,
      taker: 0.2
    });

    expect(sut.calculateTakerFee(2000)).toEqual(4);
    expect(sut.applyTakerFee(2000)).toEqual(1996);
  });
});
