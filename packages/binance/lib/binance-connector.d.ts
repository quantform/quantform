import { decimal } from '@quantform/core';
export declare class BinanceConnector {
    private readonly endpoint;
    constructor(apiKey?: string, apiSecret?: string);
    useServerTime(): any;
    unsubscribe(): Promise<void>;
    getExchangeInfo(): Promise<any>;
    trades(symbol: string, handler: (message: unknown) => void): any;
    bookTickers(symbol: string, handler: (message: unknown) => void): any;
    candlesticks(symbol: string, timeframe: string, params: any): Promise<any>;
    userData(executionReportHandler: (message: any) => void, outboundAccountPositionHandler: (message: any) => void): any;
    account(): Promise<any>;
    openOrders(): Promise<any>;
    open({ id, symbol, quantity, rate, scale }: {
        id: string;
        symbol: string;
        quantity: decimal;
        rate?: decimal;
        scale: number;
    }): Promise<any>;
    cancel(order: {
        symbol: string;
        externalId: string;
    }): Promise<void>;
}
//# sourceMappingURL=binance-connector.d.ts.map