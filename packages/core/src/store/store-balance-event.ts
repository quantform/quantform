import { AssetSelector, Balance } from '../domain';
import { decimal, timestamp } from '../shared';
import { assetNotSupportedError } from './error';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';

/**
 * Updates the free and freezed balance of the given asset.
 */
export class BalanceLoadEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly available: decimal,
    readonly unavailable: decimal,
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
    balance.available = this.available;
    balance.unavailable = this.unavailable;
    balance.clearTransientFunding();

    state.timestamp = this.timestamp;

    changes.commit(balance);
  }
}

/**
 *
 */
export class BalancePatchEvent implements StoreEvent {
  constructor(
    readonly asset: AssetSelector,
    readonly available: decimal,
    readonly unavailable: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker) {
    const asset = state.universe.asset.get(this.asset.id);
    if (!asset) {
      throw assetNotSupportedError(this.asset);
    }

    const balance = state.balance.tryGetOrSet(this.asset.id, () => new Balance(0, asset));

    balance.timestamp = this.timestamp;
    balance.available = this.available;
    balance.unavailable = this.unavailable;
    balance.clearTransientFunding();

    state.timestamp = this.timestamp;

    changes.commit(balance);
  }
}
