import { decimal, log, Logger, retry } from '@quantform/core';

import { BINANCE_ADAPTER_NAME } from '@lib/binance-adapter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Binance = require('node-binance-api');

export class BinanceConnector {
  private readonly endpoint: any;
  private readonly logger = log(BINANCE_ADAPTER_NAME);

  constructor(apiKey?: string, apiSecret?: string) {
    this.endpoint = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      log: (message: string) => this.logger.info(message)
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

  trades(symbol: string, handler: (message: unknown) => void) {
    return this.endpoint.websockets.trades(symbol, handler);
  }

  bookTickers(symbol: string, handler: (message: unknown) => void) {
    return this.endpoint.websockets.bookTickers(symbol, handler);
  }

  candlesticks(symbol: string, timeframe: string, params: any): Promise<any> {
    return retry<any>(() => this.endpoint.candlesticks(symbol, timeframe, false, params));
  }

  userData(
    executionReportHandler: (message: any) => void,
    outboundAccountPositionHandler: (message: any) => void
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
    scale
  }: {
    id: string;
    symbol: string;
    quantity: decimal;
    rate?: decimal;
    scale: number;
  }): Promise<any> {
    let response;

    this.logger.debug('requesting new order open...', {
      id,
      symbol,
      quantity,
      rate,
      scale
    });

    if (rate) {
      if (quantity.greaterThan(0)) {
        response = await this.endpoint.buy(
          symbol,
          quantity.toFixed(),
          rate.toFloor(scale),
          {
            newClientOrderId: id
          }
        );
      } else if (quantity.lessThan(0)) {
        response = await this.endpoint.sell(
          symbol,
          quantity.abs().toFixed(),
          rate.toFloor(scale),
          {
            newClientOrderId: id
          }
        );
      }
    } else {
      if (quantity.greaterThan(0)) {
        response = await this.endpoint.marketBuy(symbol, quantity.toFixed(), {
          newClientOrderId: id
        });
      } else if (quantity.lessThan(0)) {
        response = await this.endpoint.marketSell(symbol, quantity.abs().toFixed(), {
          newClientOrderId: id
        });
      }
    }

    if (response.msg) {
      throw new Error(response.msg);
    }

    this.logger.debug('responded new order open', response);

    return response;
  }

  async cancel(order: { symbol: string; externalId: string }) {
    const response = await this.endpoint.cancel(order.symbol, order.externalId);

    if (response.statusCode == 400) {
      throw new Error(response.msg);
    }
  }
}
