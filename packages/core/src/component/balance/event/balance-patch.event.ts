import { AssetSelector, Balance } from '@lib/component';
import { decimal, timestamp } from '@lib/shared';
import {
  AssetNotSupportedError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

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
      throw new AssetNotSupportedError(this.asset);
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
