import { timestamp } from '../shared';
import { Asset } from './';
import { Component } from './component';
import { Position, PositionMode } from './position';

/**
 * Represents single asset balance in your wallet.
 */
export class Balance implements Component {
  timestamp: timestamp;

  readonly maintenanceMarginRate = 1;

  private available = 0;
  private unavailable = 0;

  /**
   * Returns available amount to trade.
   */
  get free(): number {
    return (
      this.available +
      this.getEstimatedUnrealizedPnL('CROSS') -
      this.getEstimatedMaintenanceMargin('CROSS')
    );
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
      this.available + this.unavailable + this.getEstimatedUnrealizedPnL() /* +
      this.getEstimatedMaintenanceMargin()*/
    );
  }

  /**
   * Collection of opened positions backed by this balance.
   */
  position: Record<string, Position> = {};

  constructor(public readonly asset: Asset) {}

  transact(amount: number) {
    if (this.available + amount < 0) {
      throw new Error(`invalid balance amount has: ${this.available} wants: ${amount}`);
    }

    this.available += amount;
  }

  set(free: number, freezed: number) {
    if (free != null) {
      this.available = free;
    }

    if (freezed != null) {
      this.unavailable = freezed;
    }
  }

  /**
   * Lock specific amount of asset.
   * If you place new pending order, you will lock your balance to fund order.
   */
  freez(amount: number) {
    if (this.available < amount) {
      throw new Error(`insufficient funds has: ${this.available} wants: ${amount}`);
    }

    this.available -= amount;
    this.unavailable += amount;
  }

  unfreez(amount: number) {
    if (this.unavailable < amount) {
      throw new Error(`insufficient funds has: ${this.unavailable} wants: ${amount}`);
    }

    this.available += amount;
    this.unavailable -= amount;
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

  getEstimatedMaintenanceMargin(mode?: PositionMode): number {
    return this.getEstimatedMargin(mode) * this.maintenanceMarginRate;
  }

  toString() {
    return this.asset.toString();
  }
}
