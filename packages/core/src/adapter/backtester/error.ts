export class MissingPeriodParametersError extends Error {
  constructor() {
    super('invalid backtest options, please provide from and to period.');
  }
}

export class InvalidEventSequenceError extends Error {
  constructor() {
    super('invalid event to consume');
  }
}
