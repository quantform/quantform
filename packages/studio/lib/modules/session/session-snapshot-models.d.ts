import { Balance, Order, Position } from '@quantform/core';
export declare type SnapshotComponent = {
    key: string;
};
export declare type SessionSnapshotContextState = {
    balance: Record<string, BalanceSnapshot>;
    orders: Record<string, OrderSnapshot>;
    positions: Record<string, PositionSnapshot>;
};
export declare type BalanceSnapshot = SnapshotComponent & {
    asset: string;
    adapter: string;
    free: string;
    locked: string;
    scale: number;
    kind: string;
    timestamp: number;
};
export declare function getBalanceSnapshot(balance: Balance): BalanceSnapshot;
export interface OrderSnapshot extends SnapshotComponent {
    instrument: string;
    type: string;
    quantity: string;
    quantityExecuted: string;
    rate?: string;
    state: string;
    averageExecutionRate?: string;
    createdAt: number;
    kind: string;
    isBuy: boolean;
    timestamp: number;
}
export declare function getOrderSnapshot(order: Order): OrderSnapshot;
export interface PositionSnapshot extends SnapshotComponent {
    instrument: string;
    size: string;
    averageExecutionRate: string;
    leverage: number;
    mode: string;
    estimatedUnrealizedPnL?: string;
    kind: string;
    timestamp: number;
}
export declare function getPositionSnapshot(position: Position): PositionSnapshot;
//# sourceMappingURL=session-snapshot-models.d.ts.map