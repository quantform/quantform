import { InstrumentSelector, OrderState } from '../domain';

export function instrumentNotSubscribedError(instrument: InstrumentSelector) {
  return new Error(`trying to patch a not subscribed instrument ${instrument.id}`);
}

export function instrumentNotSupportedError(instrument: InstrumentSelector) {
  return new Error(`instrument ${instrument.id} not supported.`);
}

export function liquidationError() {
  return new Error('you have been liquidated.');
}

export function orderNotFoundError(id: string) {
  return new Error(`trying to patch unknown order: ${id}`);
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
