import { Decimal } from 'decimal.js';

export class decimal extends Decimal {}

export function weightedMean(values: decimal[], weights: decimal[]): decimal {
  const result = values
    .map((value, i) => {
      const weight = weights[i];
      const sum = value.mul(weight);
      return [sum, weight];
    })
    .reduce((p, c) => [p[0].add(c[0]), p[1].add(c[1])], [new decimal(0), new decimal(0)]);

  if (!result[1]) {
    return new decimal(0);
  }

  return result[0].div(result[1]);
}

export function pnl(entryRate: decimal, exitRate: decimal, amount: decimal) {
  return exitRate.div(entryRate).minus(1).mul(amount);
}

/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
export function candledown(timestamp: number, timeframe: number): number {
  return timestamp - (timestamp % timeframe);
}

/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
export function candleup(timestamp: number, timeframe: number): number {
  return candledown(timestamp, timeframe) + timeframe;
}
