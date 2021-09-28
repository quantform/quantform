import { ceil, fixed, floor, precision } from './decimals';

describe('decimals tests', () => {
  test('get precision tests', () => {
    expect(precision(0.01)).toEqual(2);
    expect(precision(0.0054)).toEqual(4);
    expect(precision(0.9)).toEqual(1);
    expect(precision(0.0)).toEqual(0);
    expect(precision(2)).toEqual(0);
  });

  test('fixed tests', () => {
    expect(fixed(0.01, 2)).toEqual(0.01);
    expect(fixed(0.011, 2)).toEqual(0.01);
    expect(fixed(0.019, 2)).toEqual(0.02);
    expect(fixed(0.019, 0)).toEqual(0);
  });

  test('floor tests', () => {
    expect(floor(0.01, 2)).toEqual(0.01);
    expect(floor(0.000000019, 8)).toEqual(0.00000001);
    expect(floor(0.011, 2)).toEqual(0.01);
    expect(floor(0.019, 2)).toEqual(0.01);
    expect(floor(0.019, 0)).toEqual(0);
  });

  test('ceil tests', () => {
    expect(ceil(0.01, 2)).toEqual(0.01);
    expect(ceil(0.000000019, 8)).toEqual(0.00000002);
    expect(ceil(0.011, 2)).toEqual(0.02);
    expect(ceil(0.019, 2)).toEqual(0.02);
    expect(ceil(0.019, 0)).toEqual(1);
  });
});
