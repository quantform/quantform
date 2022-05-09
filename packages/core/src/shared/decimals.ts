/**
 * calculate the number of decimal places of a number
 * @param value
 * @returns a precision number of the value
 */
export function precision(value: number) {
  if (!isFinite(value)) {
    return 0;
  }

  let e = 1;
  let p = 0;

  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p++;
  }

  return p;
}

/**
 * round down the number to the given precision
 * @param number
 * @param precision
 * @returns rounded down number
 */
export function floor(number: number, precision: number): number {
  const fixed = Math.pow(10, precision);

  return Math.floor(number * fixed) / fixed;
}

/**
 * round up the number to the given precision
 * @param number
 * @param precision
 * @returns rounded up number
 */
export function ceil(number: number, precision: number): number {
  const fixed = Math.pow(10, precision);

  return Math.ceil(number * fixed) / fixed;
}

/**
 * round the number to the given precision
 * @param number
 * @param precision
 * @returns rounded number
 */
export function fixed(number: number, precision: number): number {
  return (
    Math.floor((number + Number.EPSILON) * Math.pow(10, precision)) /
    Math.pow(10, precision)
  );
}

export function weightedMean(values: number[], weights: number[]) {
  const result = values
    .map((value, i) => {
      const weight = weights[i];
      const sum = value * weight;
      return [sum, weight];
    })
    .reduce((p, c) => [p[0] + c[0], p[1] + c[1]], [0, 0]);

  if (!result[1]) {
    return 0;
  }

  return result[0] / result[1];
}

export function pnl(entryRate: number, exitRate: number, amount: number) {
  return (exitRate / entryRate - 1) * amount;
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
