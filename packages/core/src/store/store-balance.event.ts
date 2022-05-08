import { AssetSelector, Balance, InstrumentSelector } from '../domain';
import { timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

/**
 * Updates the free and freezed balance of the given asset.
 */
export class BalancePatchEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly free: number,
    readonly freezed: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    // you can have not tradeable assets in wallet, skip them.
    const asset = state.universe.asset.get(this.asset.id);
    if (!asset) {
      return;
    }

    const balance = state.balance.tryGetOrSet(this.asset.id, () => new Balance(asset));

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
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const balance = state.balance.tryGetOrSet(this.asset.id, () => {
      const asset = state.universe.asset.get(this.asset.id);

      return new Balance(asset);
    });

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
    const order = state.order.get(this.instrument.id).get(this.orderId);
    const base = state.balance.get(order.instrument.base.id);
    const quote = state.balance.get(order.instrument.quote.id);

    const balanceToLock = order.calculateBalanceToLock(base, quote);

    state.timestamp = this.timestamp;

    if (balanceToLock.base > 0) {
      base.timestamp = this.timestamp;
      base.lock(balanceToLock.base);

      changes.commit(base);
    }

    if (balanceToLock.quote > 0) {
      quote.timestamp = this.timestamp;
      quote.lock(balanceToLock.quote);

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
    const order = state.order.get(this.instrument.id).get(this.orderId);
    const base = state.balance.get(order.instrument.base.id);
    const quote = state.balance.get(order.instrument.quote.id);

    const balanceToLock = order.calculateBalanceToLock(base, quote);

    state.timestamp = this.timestamp;

    if (balanceToLock.base > 0) {
      base.timestamp = this.timestamp;
      base.unlock(balanceToLock.base);

      changes.commit(base);
    }

    if (balanceToLock.quote > 0) {
      quote.timestamp = this.timestamp;
      quote.unlock(balanceToLock.quote);

      changes.commit(quote);
    }
  }
}
