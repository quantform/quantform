import { timestamp } from '../common';
import { Asset } from './';
import { Position, PositionMode } from './position';
import { Component } from './component';

/**
 * Represents single asset abalance in your wallet.
 */
export class Balance implements Component {
  timestamp: timestamp;

  readonly maintenanceMarginRate = 1;

  private _free = 0;
  private _freezed = 0;

  /**
   * Returns available amount to trade.
   */
  get free(): number {
    return (
      this._free +
      this.getEstimatedUnrealizedPnL('CROSS') -
      this.getEstimatedMaintenanceMargin('CROSS')
    );
  }

  /**
   * Return locked amount for order.
   */
  get freezed(): number {
    return this._freezed;
  }

  /**
   * Return total amount of asset in wallet.
   * Represents a sum of free, locked and opened positions.
   */
  get total(): number {
    return (
      this._free +
      this._freezed +
      this.getEstimatedUnrealizedPnL() /* +
      this.getEstimatedMaintenanceMargin()*/
    );
  }

  /**
   * Collection of opened positions backed by this balance.
   */
  position: Record<string, Position> = {};

  constructor(public readonly asset: Asset) {}

  transact(amount: number) {
    if (this._free + amount < 0) {
      throw new Error(`invalid balance amount has: ${this._free} wants: ${amount}`);
    }

    this._free += amount;
  }

  set(free: number, freezed: number) {
    if (free != null) {
      this._free = free;
    }

    if (freezed != null) {
      this._freezed = freezed;
    }
  }

  /**
   * Lock specific amount of asset.
   * If you place new pending order, you will lock your balance to fund order.
   */
  freez(amount: number) {
    if (this._free < amount) {
      throw new Error(`insufficient funds has: ${this._free} wants: ${amount}`);
    }

    this._free -= amount;
    this._freezed += amount;
  }

  unfreez(amount: number) {
    if (this._freezed < amount) {
      throw new Error(`insufficient funds has: ${this._freezed} wants: ${amount}`);
    }

    this._free += amount;
    this._freezed -= amount;
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
