import { Asset, Component, Position, PositionMode } from '@lib/domain';
import { d, decimal, hash } from '@lib/shared';

export interface Fundable {
  id: string;
  getFundingAmount(balance: Balance): decimal;
}

/**
 * Represents single asset balance in your wallet.
 */
export class Balance implements Component {
  static type = hash(Balance.name);
  readonly type = Balance.type;

  id: string;

  private transientFunding: Record<string, Fundable> = {};

  /**
   * Returns available amount to trade.
   */
  get free(): decimal {
    return this.available.add(this.getEstimatedUnrealizedPnL('CROSS'));
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
    return this.available.plus(this.unavailable).plus(this.getEstimatedUnrealizedPnL());
  }

  /**
   * Collection of opened positions backed by this balance.
   */
  readonly position: Record<string, Position> = {};

  constructor(
    public timestamp: number,
    public readonly asset: Asset,
    public available: decimal = d.Zero,
    public unavailable: decimal = d.Zero
  ) {
    this.id = asset.id;
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

  tryAddTransientFunding(fundable: Fundable) {
    if (fundable.id in this.transientFunding) {
      return false;
    }

    this.transientFunding[fundable.id] = fundable;

    const funding = fundable.getFundingAmount(this);

    this.available = this.available.minus(funding);
    this.unavailable = this.unavailable.plus(funding);

    return true;
  }

  tryRemoveTransientFunding(fundable: Fundable) {
    if (!(fundable.id in this.transientFunding)) {
      return false;
    }

    const funding = fundable.getFundingAmount(this);

    this.available = this.available.plus(funding);
    this.unavailable = this.unavailable.minus(funding);

    return true;
  }

  clearTransientFunding() {
    this.transientFunding = {};
  }
}
