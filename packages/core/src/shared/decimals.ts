import { Decimal } from 'decimal.js';

declare module 'decimal.js' {
  interface Decimal {
    toFloor(decimalPlaces: number): Decimal;
    toCeil(decimalPlaces: number): Decimal;
  }
}

Decimal.prototype.toFloor = function (decimalPlaces: number) {
  return this.toDecimalPlaces(decimalPlaces, Decimal.ROUND_FLOOR);
};

Decimal.prototype.toCeil = function (decimalPlaces: number) {
  return this.toDecimalPlaces(decimalPlaces, Decimal.ROUND_CEIL);
};

export class decimal extends Decimal {}

export function d(value: Decimal.Value) {
  return new decimal(value);
}

d.Zero = new decimal(0);
