import { fixed, OrderType, retry } from '@quantform/core';

const Binance = require('node-binance-api');

export class BinanceConnector {
  private readonly endpoint: any;

  constructor(apiKey?: string, apiSecret?: string) {
    this.endpoint = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      log: () => {}
    });
  }

  useServerTime() {
    return this.endpoint.useServerTime();
  }

  async unsubscribe() {
    for (const key in this.endpoint.websockets.subscriptions()) {
      await this.endpoint.websockets.terminate(key);
    }
  }

  async getExchangeInfo(): Promise<any> {
    return retry<any>(() => this.endpoint.exchangeInfo());
  }

  trades(symbol: string, handler: (message) => void) {
    return this.endpoint.websockets.trades(symbol, handler);
  }

  bookTickers(symbol: string, handler: (message) => void) {
    return this.endpoint.websockets.bookTickers(symbol, handler);
  }

  candlesticks(symbol: string, timeframe: string, params: any): Promise<any> {
    return retry<any>(() => this.endpoint.candlesticks(symbol, timeframe, false, params));
  }

  userData(
    executionReportHandler: (message) => void,
    outboundAccountPositionHandler: (message) => void
  ) {
    const handler = (message: any) => {
      switch (message.e) {
        case 'executionReport':
          executionReportHandler(message);
          break;
        case 'outboundAccountPosition':
          outboundAccountPositionHandler(message);
          break;
        default:
          throw new Error('Unsupported event type.');
      }
    };

    return this.endpoint.websockets.userData(handler, handler);
  }

  account(): Promise<any> {
    return retry<any>(() => this.endpoint.account());
  }

  openOrders(): Promise<any> {
    return retry<any>(() => this.endpoint.openOrders());
  }

  async open({
    id,
    symbol,
    quantity,
    rate,
    type,
    scale
  }: {
    id: string;
    symbol: string;
    quantity: number;
    rate?: number;
    type: OrderType;
    scale: number;
  }): Promise<any> {
    let response;

    switch (type) {
      case 'MARKET':
        if (quantity > 0) {
          response = await this.endpoint.marketBuy(symbol, quantity, {
            newClientOrderId: id
          });
        } else if (quantity < 0) {
          response = await this.endpoint.marketSell(symbol, -quantity, {
            newClientOrderId: id
          });
        }
        break;
      case 'LIMIT':
        if (quantity > 0) {
          response = await this.endpoint.buy(symbol, quantity, rate.toFixed(scale), {
            newClientOrderId: id
          });
        } else if (quantity < 0) {
          response = await this.endpoint.sell(symbol, -quantity, rate.toFixed(scale), {
            newClientOrderId: id
          });
        }
        break;
    }

    if (response.msg) {
      throw new Error(response.msg);
    }

    return response;
  }

  async cancel(order: { symbol: string; externalId: string }) {
    const response = await this.endpoint.cancel(order.symbol, order.externalId);

    if (response.statusCode == 400) {
      throw new Error(response.msg);
    }
  }
}
