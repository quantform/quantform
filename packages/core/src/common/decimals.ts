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

export function fixed(number: number, precision: number): number {
  const pow = Math.pow(10, precision);

  const value = Math.round(number * pow) / pow;

  if (Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function floor(number: number, precision: number): number {
  const value = +(Math.floor(Number(number + 'e+' + precision)) + 'e-' + precision);

  if (Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function ceil(number: number, precision: number): number {
  const value = +(Math.ceil(Number(number + 'e+' + precision)) + 'e-' + precision);

  if (Number.isNaN(value)) {
    return 0;
  }

  return value;
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

export function pnl(entryRate: number, exitRate: number, size: number) {
  const cost = size * entryRate;
  const unrealized = size * exitRate;

  return unrealized - cost;
}

export function candledown(timestamp: number, timeframe: number): number {
  return timestamp - (timestamp % timeframe);
}

export function candleup(timestamp: number, timeframe: number): number {
  return candledown(timestamp, timeframe) + timeframe;
}
