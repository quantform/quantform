import { BalancePatchEvent, Candle, Commission, InstrumentPatchEvent, InstrumentSelector, OrderbookPatchEvent, OrderLoadEvent, OrderNewEvent, OrderPendingEvent, State, StoreEvent, TradePatchEvent } from '@quantform/core';
export declare function timeframeToBinance(timeframe: number): string;
export declare function binanceToBalancePatchEvent(response: any, timestamp: number): BalancePatchEvent;
export declare function binanceToOrderLoadEvent(response: any, state: State, timestamp: number): OrderLoadEvent;
export declare function binanceToInstrumentPatchEvent(response: any, timestamp: number): InstrumentPatchEvent;
export declare function binanceToTradePatchEvent(message: any, instrument: InstrumentSelector, timestamp: number): TradePatchEvent;
export declare function binanceToOrderbookPatchEvent(message: any, instrument: InstrumentSelector, timestamp: number): OrderbookPatchEvent;
export declare function binanceOutboundAccountPositionToBalancePatchEvent(message: any, timestamp: number): BalancePatchEvent;
export declare function binanceExecutionReportToEvents(message: any, state: State, queuedOrderCompletionEvents: StoreEvent[], timestamp: number): (OrderNewEvent | OrderPendingEvent)[];
export declare function binanceToCandle(response: any): Candle;
export declare function binanceToCommission(response: any): Commission;
//# sourceMappingURL=binance-mapper.d.ts.map