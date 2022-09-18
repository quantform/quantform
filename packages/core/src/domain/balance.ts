import { d, decimal } from '../shared';
import { Asset } from './';
import { Component } from './component';
import { insufficientFundsError, invalidArgumentError } from './error';
import { Position, PositionMode } from './position';

/**
 * Represents single asset balance in your wallet.
 */
export class Balance implements Component {
  id: string;
  kind = 'balance';

  private locker: Record<string, decimal> = {};
  private available = d.Zero;
  private unavailable = d.Zero;

  /**
   * Returns available amount to trade.
   */
  get free(): decimal {
    return this.asset.floor(this.available).add(this.getEstimatedUnrealizedPnL('CROSS'));
  }

  /**
   * Return locked amount for order.
   */
  get locked(): decimal {
    return this.unavailable;
  }

  /**
   * Return total amount of asset in wallet.
   * Represents a sum of free, locked and opened positions.
   */
  get total(): decimal {
    return this.asset
      .floor(this.available.add(this.unavailable))
      .add(this.getEstimatedUnrealizedPnL());
  }

  /**
   * Collection of opened positions backed by this balance.
   */
  readonly position: Record<string, Position> = {};

  constructor(public timestamp: number, public readonly asset: Asset) {
    this.id = asset.id;
  }

  account(amount: decimal) {
    if (this.available.add(amount).lessThan(0)) {
      throw insufficientFundsError(this.id, amount, this.available);
    }

    this.available = this.available.add(amount);
  }

  set(free: decimal, locked: decimal) {
    this.available = free;
    this.unavailable = locked;
    this.locker = {};
  }

  /**
   * Lock specific amount of asset.
   * If you place new pending order, you will lock your balance to fund order.
   */
  lock(id: string, amount: decimal) {
    if (this.available.lessThan(amount)) {
      throw insufficientFundsError(this.id, amount, this.available);
    }

    if (this.locker[id]) {
      throw invalidArgumentError(id);
    }

    this.locker[id] = amount;
    this.available = this.available.minus(amount);
    this.unavailable = this.unavailable.plus(amount);
  }

  tryUnlock(id: string): boolean {
    if (!this.locker[id]) {
      return false;
    }

    const amount = this.locker[id];

    delete this.locker[id];

    if (this.unavailable < amount) {
      throw insufficientFundsError(this.id, amount, this.unavailable);
    }

    this.available = this.available.add(amount);
    this.unavailable = this.unavailable.minus(amount);

    return true;
  }

  /**
   * Returns unrealized profit and loss for all positions backed by this balance.
   */
  getEstimatedUnrealizedPnL(mode?: PositionMode): decimal {
    return Object.values(this.position).reduce(
      (aggregate, position) =>
        aggregate.add(
          mode && mode != position.mode
            ? d.Zero
            : position.estimatedUnrealizedPnL ?? d.Zero
        ),
      d.Zero
    );
  }

  getEstimatedMargin(mode?: PositionMode): decimal {
    return Object.values(this.position).reduce(
      (aggregate, position) =>
        (aggregate = aggregate.add(mode && mode != position.mode ? 0 : position.margin)),
      d.Zero
    );
  }

  toString() {
    return this.asset.toString();
  }
}
