import { AssetSelector, Balance, InstrumentSelector } from '../domain';
import { timestamp } from '../shared';
import { State, StateChangeTracker } from './store-state';
import { StoreEvent } from './store.event';

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
export class BalanceFreezEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const balance = state.balance.get(this.asset.id);
    if (!balance) {
      throw new Error('invalid balance');
    }

    balance.timestamp = this.timestamp;
    balance.lock(this.amount);

    state.timestamp = this.timestamp;

    changes.commit(balance);
  }
}

/**
 *
 */
export class BalanceUnfreezEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly amount: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const balance = state.balance.get(this.asset.id);
    if (!balance) {
      throw new Error('invalid balance');
    }

    balance.timestamp = this.timestamp;
    balance.unlock(this.amount);

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
    const baseBalance = state.balance.get(order.instrument.base.id);
    const quoteBalance = state.balance.get(order.instrument.quote.id);

    const balanceToLock = order.calculateBalanceToLock(baseBalance, quoteBalance);

    state.timestamp = this.timestamp;

    if (balanceToLock.base > 0) {
      baseBalance.timestamp = this.timestamp;
      baseBalance.lock(balanceToLock.base);

      changes.commit(baseBalance);
    }

    if (balanceToLock.quote > 0) {
      quoteBalance.timestamp = this.timestamp;
      quoteBalance.lock(balanceToLock.quote);

      changes.commit(quoteBalance);
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
    const baseBalance = state.balance.get(order.instrument.base.id);
    const quoteBalance = state.balance.get(order.instrument.quote.id);

    const balanceToLock = order.calculateBalanceToLock(baseBalance, quoteBalance);

    state.timestamp = this.timestamp;

    if (balanceToLock.base > 0) {
      baseBalance.timestamp = this.timestamp;
      baseBalance.unlock(balanceToLock.base);

      changes.commit(baseBalance);
    }

    if (balanceToLock.quote > 0) {
      quoteBalance.timestamp = this.timestamp;
      quoteBalance.unlock(balanceToLock.quote);

      changes.commit(quoteBalance);
    }
  }
}
