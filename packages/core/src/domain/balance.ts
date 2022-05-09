import { timestamp } from '../shared';
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
  timestamp: timestamp;

  private locker: Record<string, number> = {};
  private available = 0;
  private unavailable = 0;

  /**
   * Returns available amount to trade.
   */
  get free(): number {
    return this.asset.fixed(this.available) + this.getEstimatedUnrealizedPnL('CROSS');
  }

  /**
   * Return locked amount for order.
   */
  get locked(): number {
    return this.unavailable;
  }

  /**
   * Return total amount of asset in wallet.
   * Represents a sum of free, locked and opened positions.
   */
  get total(): number {
    return (
      this.asset.fixed(this.available + this.unavailable) +
      this.getEstimatedUnrealizedPnL()
    );
  }

  /**
   * Collection of opened positions backed by this balance.
   */
  readonly position: Record<string, Position> = {};

  constructor(public readonly asset: Asset) {
    this.id = asset.id;
  }

  account(amount: number) {
    if (this.available + amount < 0) {
      throw insufficientFundsError(this.id, amount, this.available);
    }

    this.available += amount;
  }

  set(free: number, locked: number) {
    this.available = free;
    this.unavailable = locked;
    this.locker = {};
  }

  /**
   * Lock specific amount of asset.
   * If you place new pending order, you will lock your balance to fund order.
   */
  lock(id: string, amount: number) {
    if (this.available < amount) {
      throw insufficientFundsError(this.id, amount, this.available);
    }

    if (this.locker[id]) {
      throw invalidArgumentError(id);
    }

    this.locker[id] = amount;
    this.available -= amount;
    this.unavailable += amount;
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

    this.available += amount;
    this.unavailable -= amount;

    return true;
  }

  /**
   * Returns unrealized profit and loss for all positions backed by this balance.
   */
  getEstimatedUnrealizedPnL(mode?: PositionMode) {
    return Object.values(this.position).reduce(
      (aggregate, position) =>
        (aggregate +=
          mode && mode != position.mode ? 0 : position.estimatedUnrealizedPnL),
      0
    );
  }

  getEstimatedMargin(mode?: PositionMode): number {
    return Object.values(this.position).reduce(
      (aggregate, position) =>
        (aggregate += mode && mode != position.mode ? 0 : position.margin),
      0
    );
  }

  toString() {
    return this.asset.toString();
  }
}
