import { AssetSelector, Balance, InstrumentSelector } from '../domain';
import { decimal, timestamp } from '../shared';
import {
  assetNotSupportedError,
  balanceNotFoundError,
  instrumentNotSubscribedError,
  orderNotFoundError
} from './error';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';

/**
 * Updates the free and freezed balance of the given asset.
 */
export class BalancePatchEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly free: decimal,
    readonly freezed: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    /*
     * skip not tradeable assets (for example, you can have an unlisted
     * asset in your wallet).
     */
    const asset = state.universe.asset.get(this.asset.id);
    if (!asset) {
      return;
    }

    const balance = state.balance.tryGetOrSet(this.asset.id, () => new Balance(0, asset));

    balance.timestamp = this.timestamp;
    balance.set(this.free, this.freezed);

    state.timestamp = this.timestamp;

    changes.commit(balance);
  }
}

/**
 *
 */
export class BalanceTransactEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly amount: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const asset = state.universe.asset.get(this.asset.id);
    if (!asset) {
      throw assetNotSupportedError(this.asset);
    }

    const balance = state.balance.tryGetOrSet(this.asset.id, () => new Balance(0, asset));

    balance.timestamp = this.timestamp;
    balance.account(this.amount);

    state.timestamp = this.timestamp;

    changes.commit(balance);
  }
}

/**
 *
 */
export class BalanceLockOrderEvent implements StoreEvent {
  constructor(
    readonly orderId: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const orders = state.order.get(this.instrument.id);
    if (!orders) {
      throw instrumentNotSubscribedError(this.instrument);
    }

    const order = orders.get(this.orderId);
    if (!order) {
      throw orderNotFoundError(this.orderId);
    }

    const base = state.balance.get(order.instrument.base.id);
    if (!base) {
      throw balanceNotFoundError(order.instrument.base);
    }

    const quote = state.balance.get(order.instrument.quote.id);
    if (!quote) {
      throw balanceNotFoundError(order.instrument.quote);
    }

    const balanceToLock = order.calculateBalanceToLock(base, quote);

    state.timestamp = this.timestamp;

    if (balanceToLock.base?.greaterThan(0)) {
      base.timestamp = this.timestamp;
      base.lock(this.orderId, balanceToLock.base);

      changes.commit(base);
    }

    if (balanceToLock.quote?.greaterThan(0)) {
      quote.timestamp = this.timestamp;
      quote.lock(this.orderId, balanceToLock.quote);

      changes.commit(quote);
    }
  }
}

/**
 *
 */
export class BalanceUnlockOrderEvent implements StoreEvent {
  constructor(
    readonly orderId: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const orders = state.order.get(this.instrument.id);
    if (!orders) {
      throw instrumentNotSubscribedError(this.instrument);
    }

    const order = orders.get(this.orderId);
    if (!order) {
      throw orderNotFoundError(this.orderId);
    }

    const base = state.balance.get(order.instrument.base.id);
    if (!base) {
      throw balanceNotFoundError(order.instrument.base);
    }

    const quote = state.balance.get(order.instrument.quote.id);
    if (!quote) {
      throw balanceNotFoundError(order.instrument.quote);
    }

    state.timestamp = this.timestamp;

    if (base.tryUnlock(this.orderId)) {
      base.timestamp = this.timestamp;

      changes.commit(base);
    }

    if (quote.tryUnlock(this.orderId)) {
      quote.timestamp = this.timestamp;

      changes.commit(quote);
    }
  }
}