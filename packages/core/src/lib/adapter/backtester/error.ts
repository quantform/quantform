export function missingPeriodParametersError() {
  return new Error('invalid backtest options, please provide from and to period.');
}

export function invalidEventSequenceError() {
  return new Error('invalid event to consume');
}
