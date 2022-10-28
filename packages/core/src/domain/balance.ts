import { d, decimal } from '../shared';
import { Asset, Order } from './';
import { Component } from './component';
import { invalidArgumentError } from './error';
import { Position, PositionMode } from './position';

/**
 * Represents single asset balance in your wallet.
 */
export class Balance implements Component {
  id: string;

  /**
   * Returns available amount to trade.
   */
  get free(): decimal {
    return this.asset.floor(
      this.amount.minus(this.locked).add(this.getEstimatedUnrealizedPnL('CROSS'))
    );
  }

  /**
   * Return locked amount for order.
   */
  get locked(): decimal {
    return this.getOrderLockedAmount();
  }

  /**
   * Return total amount of asset in wallet.
   * Represents a sum of free, locked and opened positions.
   */
  get total(): decimal {
    return this.asset.floor(this.amount.add(this.getEstimatedUnrealizedPnL()));
  }

  /**
   * Collection of pending orders backed by this balance.
   */
  readonly order: Record<string, Order> = {};

  /**
   * Collection of opened positions backed by this balance.
   */
  readonly position: Record<string, Position> = {};

  constructor(
    public timestamp: number,
    public readonly asset: Asset,
    public amount: decimal = d.Zero
  ) {
    this.id = asset.id;
  }

  updateByOrder(order: Order) {
    switch (order.state) {
      case 'FILLED':
      case 'CANCELED':
      case 'REJECTED':
        delete this.order[order.id];
        break;
      case 'NEW':
      case 'PENDING':
      case 'CANCELING':
        this.order[order.id] = order;
        break;
      default:
        throw invalidArgumentError(order);
    }
  }

  getOrderLockedAmount(): decimal {
    let locked = d.Zero;

    for (const order of Object.values(this.order)) {
      if (order.quantity.greaterThan(d.Zero)) {
        if (!order.rate) {
          return this.amount;
        }

        locked = locked.add(order.quantity.mul(order.rate).abs());
      } else {
        locked = locked.add(order.quantity.abs());
      }
    }

    return locked;
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
}
