import { AssetSelector, InstrumentSelector, OrderState } from '@lib/domain';

export class AssetNotSupportedError extends Error {
  constructor(selector: AssetSelector) {
    super(`asset ${selector.id} not supported.`);
  }
}

export class InstrumentNotSubscribedError extends Error {
  constructor(selector: InstrumentSelector) {
    super(`trying to patch a not subscribed instrument ${selector.id}`);
  }
}

export class InstrumentNotSupportedError extends Error {
  constructor(selector: InstrumentSelector) {
    super(`instrument ${selector.id} not supported.`);
  }
}

export class LiquidationError extends Error {
  constructor() {
    super('you have been liquidated.');
  }
}

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`trying to patch unknown order: ${id}`);
  }
}

export class BalanceNotFoundError extends Error {
  constructor(selector: AssetSelector) {
    super(`balance not found: ${selector.id}`);
  }
}

export class OrderInvalidStateError extends Error {
  constructor(currentState: OrderState, requiredStates: OrderState[]) {
    super(
      `order state ${currentState} is not in one of required states: ${requiredStates.join(
        ', '
      )}`
    );
  }
}
