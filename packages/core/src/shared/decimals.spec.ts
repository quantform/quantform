import { d } from './decimals';

describe('decimals', () => {
  test('get precision tests', () => {
    expect(d(0.01).decimalPlaces()).toEqual(2);
    expect(d(0.0054).decimalPlaces()).toEqual(4);
    expect(d(0.9).decimalPlaces()).toEqual(1);
    expect(d(0.0).decimalPlaces()).toEqual(0);
    expect(d(2).decimalPlaces()).toEqual(0);
  });

  test('trunc tests', () => {
    expect(d(0.01).toFloor(2)).toEqual(d(0.01));
    expect(d(0.011).toFloor(2)).toEqual(d(0.01));
    expect(d(0.019).toFloor(2)).toEqual(d(0.01));
    expect(d(0.019).toFloor(0)).toEqual(d(0));
    expect(d(0.00000058).toFloor(8)).toEqual(d(0.00000058));
  });

  test('floor tests', () => {
    expect(d(0.01).toFloor(2)).toEqual(d(0.01));
    expect(d(0.000000019).toFloor(8)).toEqual(d(0.00000001));
    expect(d(0.011).toFloor(2)).toEqual(d(0.01));
    expect(d(0.019).toFloor(2)).toEqual(d(0.01));
    expect(d(0.019).toFloor(0)).toEqual(d(0));
  });

  test('ceil tests', () => {
    expect(d(0.01).toCeil(2)).toEqual(d(0.01));
    expect(d(0.000000019).toCeil(8)).toEqual(d(0.00000002));
    expect(d(0.011).toCeil(2)).toEqual(d(0.02));
    expect(d(0.019).toCeil(2)).toEqual(d(0.02));
    expect(d(0.019).toCeil(0)).toEqual(d(1));
  });
});
