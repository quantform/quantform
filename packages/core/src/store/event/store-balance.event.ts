import { AssetSelector } from '../../domain/asset';
import { Balance } from '../../domain/balance';
import { InstrumentSelector } from '../../domain/instrument';
import { timestamp } from '../../shared';
import { event } from '../../shared/topic';
import { State, StateChangeTracker } from '../store-state';
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
  // you can have not tradeable assets in wallet, skip them.
  const asset = state.universe.asset.get(event.asset.id);
  if (!asset) {
    return;
  }

  const balance = state.balance.tryGetOrSet(event.asset.id, () => new Balance(asset));

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
  const balance = state.balance.tryGetOrSet(event.asset.id, () => {
    const asset = state.universe.asset.get(event.asset.id);

    return new Balance(asset);
  });

  balance.timestamp = event.timestamp;
  balance.account(event.amount);

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
  const balance = state.balance.get(event.asset.id);
  if (!balance) {
    throw new Error('invalid balance');
  }

  balance.timestamp = event.timestamp;
  balance.lock(event.amount);

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
  const balance = state.balance.get(event.asset.id);
  if (!balance) {
    throw new Error('invalid balance');
  }

  balance.timestamp = event.timestamp;
  balance.unlock(event.amount);

  state.timestamp = event.timestamp;

  changes.commit(balance);
}

/**
 *
 */
@event
export class BalanceLockOrderEvent implements StoreEvent {
  type = 'balance-lock-order';

  constructor(
    readonly orderId: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}
}

/**
 * @see BalanceLockOrderEvent
 */
export function BalanceLockOrderEventHandler(
  event: BalanceLockOrderEvent,
  state: State,
  changes: StateChangeTracker
) {
  const order = state.order.get(event.instrument.id).get(event.orderId);
  const baseBalance = state.balance.get(order.instrument.base.id);
  const quoteBalance = state.balance.get(order.instrument.quote.id);

  const balanceToLock = order.calculateBalanceToLock(baseBalance, quoteBalance);

  state.timestamp = event.timestamp;

  if (balanceToLock.base > 0) {
    baseBalance.timestamp = event.timestamp;
    baseBalance.lock(balanceToLock.base);

    changes.commit(baseBalance);
  }

  if (balanceToLock.quote > 0) {
    quoteBalance.timestamp = event.timestamp;
    quoteBalance.lock(balanceToLock.quote);

    changes.commit(quoteBalance);
  }
}
