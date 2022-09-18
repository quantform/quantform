export declare class DyDxConnector {
    private readonly options;
    private static RECONNECTION_TIMEOUT;
    private static PING_TIMEOUT;
    private readonly web3;
    private readonly client;
    private readonly emitter;
    private subscriptions;
    private socket?;
    private reconnectionTimeout?;
    private pingInterval?;
    private lastMessageTimestamp;
    constructor(options: {
        http: string;
        ws: string;
        networkId: number;
    });
    onboard(): Promise<void>;
    dispose(): void;
    getMarkets(): Promise<{
        markets: import("@dydxprotocol/v3-client").MarketsResponseObject;
    }>;
    getTrades(market: string, startingBeforeOrAt: number): Promise<{
        trades: import("@dydxprotocol/v3-client").Trade[];
    }>;
    account(handler: (message: any) => void): Promise<void>;
    trades(market: string, handler: (message: any) => void): void;
    orderbook(market: string, handler: (message: any) => void): void;
    private reconnect;
    private tryEnsureSocketConnection;
    private subscribe;
}
//# sourceMappingURL=dydx-connector.d.ts.map