import { MarketResponseObject } from '@dydxprotocol/v3-client';
import { AssetSelector, BalancePatchEvent, Instrument, InstrumentPatchEvent, InstrumentSelector, Liquidity, OrderbookPatchEvent, OrderLoadEvent, PriorityList, TradePatchEvent } from '@quantform/core';
export declare function dydxToInstrumentPatchEvent(response: MarketResponseObject, timestamp: number): InstrumentPatchEvent;
export declare function dydxToTradePatchEvent(message: any, instrument: InstrumentSelector): TradePatchEvent;
export declare function dydxOrderbookPatchSnapshot(liquidity: PriorityList<Liquidity & {
    offset: number;
}>, message: any): void;
export declare function dydxOrderbookPatchUpdate(liquidity: PriorityList<Liquidity & {
    offset: number;
}>, message: any, offset: number): void;
export declare function dydxToOrderbookPatchEvent(instrument: InstrumentSelector, asks: PriorityList<Liquidity & {
    offset: number;
}>, bids: PriorityList<Liquidity & {
    offset: number;
}>, timestamp: number): OrderbookPatchEvent;
export declare function dydxToBalanceSnapshotPatchEvent(asset: AssetSelector, message: any, timestamp: number): BalancePatchEvent;
export declare function dydxToOrderLoadEvent(message: any, instruments: Readonly<Instrument[]>, timestamp: number): OrderLoadEvent;
//# sourceMappingURL=dydx-mapper.d.ts.map