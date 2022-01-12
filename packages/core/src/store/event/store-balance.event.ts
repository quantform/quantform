import { event } from '../../shared/topic';
import { timestamp } from '../../shared';
import { AssetSelector } from '../../domain/asset';
import { Balance } from '../../domain/balance';
import { State, StateChangeTracker } from '../store.state';
import { StoreEvent } from './store.event';

/**
 * Updates the free and freezed balance of the given asset.
 */
@event
export class BalancePatchEvent implements StoreEvent {
  type = 'balance-patch';

  constructor(
    readonly asset: AssetSelector,
    readonly free: number,
    readonly freezed: number,
    readonly timestamp: timestamp
  ) {}
}

/**
 * @see BalancePatchEvent
 */
export function BalancePatchEventHandler(
  event: BalancePatchEvent,
  state: State,
  changes: StateChangeTracker
) {
  let balance = state.balance[event.asset.toString()];

  if (!balance) {
    const asset = state.universe.asset[event.asset.toString()];

    if (!asset) {
      return;
    }

    balance = state.balance[asset.toString()] = new Balance(asset);
  }

  balance.timestamp = event.timestamp;
  balance.set(event.free, event.freezed);

  state.timestamp = event.timestamp;

  changes.commit(balance);
}

/**
 *
 */
@event
export class BalanceTransactEvent implements StoreEvent {
  type = 'balance-transact';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}
}

/**
 * @see BalanceTransactEvent
 */
export function BalanceTransactEventHandler(
  event: BalanceTransactEvent,
  state: State,
  changes: StateChangeTracker
) {
  let balance = state.balance[event.asset.toString()];

  if (!balance) {
    const asset = state.universe.asset[event.asset.toString()];

    balance = new Balance(asset);

    state.balance[asset.toString()] = balance;
  }

  balance.timestamp = event.timestamp;
  balance.transact(event.amount);

  state.timestamp = event.timestamp;

  changes.commit(balance);
}

/**
 *
 */
@event
export class BalanceFreezEvent implements StoreEvent {
  type = 'balance-freez';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}
}

/**
 * @see BalanceFreezEvent
 */
export function BalanceFreezEventHandler(
  event: BalanceFreezEvent,
  state: State,
  changes: StateChangeTracker
) {
  const balance = state.balance[event.asset.toString()];

  if (!balance) {
    throw new Error('invalid balance');
  }

  balance.timestamp = event.timestamp;
  balance.freez(event.amount);

  state.timestamp = event.timestamp;

  changes.commit(balance);
}

/**
 *
 */
@event
export class BalanceUnfreezEvent implements StoreEvent {
  type = 'balance-unfreez';

  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}
}

/**
 * @see BalanceUnfreezEvent
 */
export function BalanceUnfreezEventHandler(
  event: BalanceUnfreezEvent,
  state: State,
  changes: StateChangeTracker
) {
  const balance = state.balance[event.asset.toString()];

  if (!balance) {
    throw new Error('invalid balance');
  }

  balance.timestamp = event.timestamp;
  balance.unfreez(event.amount);

  state.timestamp = event.timestamp;

  changes.commit(balance);
}
