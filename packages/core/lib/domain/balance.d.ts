import { decimal } from '../shared';
import { Asset } from './';
import { Component } from './component';
import { Position, PositionMode } from './position';
/**
 * Represents single asset balance in your wallet.
 */
export declare class Balance implements Component {
    timestamp: number;
    readonly asset: Asset;
    id: string;
    kind: string;
    private locker;
    private available;
    private unavailable;
    /**
     * Returns available amount to trade.
     */
    get free(): decimal;
    /**
     * Return locked amount for order.
     */
    get locked(): decimal;
    /**
     * Return total amount of asset in wallet.
     * Represents a sum of free, locked and opened positions.
     */
    get total(): decimal;
    /**
     * Collection of opened positions backed by this balance.
     */
    readonly position: Record<string, Position>;
    constructor(timestamp: number, asset: Asset);
    account(amount: decimal): void;
    set(free: decimal, locked: decimal): void;
    /**
     * Lock specific amount of asset.
     * If you place new pending order, you will lock your balance to fund order.
     */
    lock(id: string, amount: decimal): void;
    tryUnlock(id: string): boolean;
    /**
     * Returns unrealized profit and loss for all positions backed by this balance.
     */
    getEstimatedUnrealizedPnL(mode?: PositionMode): decimal;
    getEstimatedMargin(mode?: PositionMode): decimal;
    toString(): string;
}
//# sourceMappingURL=balance.d.ts.map