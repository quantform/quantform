import { decimal } from './decimals';

describe('decimals', () => {
  test('get precision tests', () => {
    expect(new decimal(0.01).decimalPlaces()).toEqual(2);
    expect(new decimal(0.0054).decimalPlaces()).toEqual(4);
    expect(new decimal(0.9).decimalPlaces()).toEqual(1);
    expect(new decimal(0.0).decimalPlaces()).toEqual(0);
    expect(new decimal(2).decimalPlaces()).toEqual(0);
  });

  test('trunc tests', () => {
    expect(new decimal(0.01).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.011).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.019).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.019).toFloor(0)).toEqual(new decimal(0));
    expect(new decimal(0.00000058).toFloor(8)).toEqual(new decimal(0.00000058));
  });

  test('floor tests', () => {
    expect(new decimal(0.01).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.000000019).toFloor(8)).toEqual(new decimal(0.00000001));
    expect(new decimal(0.011).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.019).toFloor(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.019).toFloor(0)).toEqual(new decimal(0));
  });

  test('ceil tests', () => {
    expect(new decimal(0.01).toCeil(2)).toEqual(new decimal(0.01));
    expect(new decimal(0.000000019).toCeil(8)).toEqual(new decimal(0.00000002));
    expect(new decimal(0.011).toCeil(2)).toEqual(new decimal(0.02));
    expect(new decimal(0.019).toCeil(2)).toEqual(new decimal(0.02));
    expect(new decimal(0.019).toCeil(0)).toEqual(new decimal(1));
  });
});
