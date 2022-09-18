import { AssetSelector, InstrumentSelector, OrderState } from '../domain';

export function assetNotSupportedError(selector: AssetSelector) {
  return new Error(`asset ${selector.id} not supported.`);
}

export function instrumentNotSubscribedError(selector: InstrumentSelector) {
  return new Error(`trying to patch a not subscribed instrument ${selector.id}`);
}

export function instrumentNotSupportedError(selector: InstrumentSelector) {
  return new Error(`instrument ${selector.id} not supported.`);
}

export function liquidationError() {
  return new Error('you have been liquidated.');
}

export function orderNotFoundError(id: string) {
  return new Error(`trying to patch unknown order: ${id}`);
}

export function balanceNotFoundError(selector: AssetSelector) {
  return new Error(`balance not found: ${selector.id}`);
}

export function orderInvalidStateError(
  currentState: OrderState,
  requiredStates: OrderState[]
) {
  return new Error(
    `order state ${currentState} is not in one of required states: ${requiredStates.join(
      ', '
    )}`
  );
}
