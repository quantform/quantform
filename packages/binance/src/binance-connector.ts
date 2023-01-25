import { BinanceOptions } from '@lib//binance-options';
import { decimal, log, provider, retry } from '@quantform/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Binance = require('node-binance-api');

@provider()
export class BinanceConnector {
  private readonly endpoint: any;
  private readonly logger = log(BinanceConnector.name);

  constructor(private readonly options: BinanceOptions) {
    this.endpoint = new Binance().options({
      APIKEY: this.options.apiKey ?? process.env.BINANCE_API_KEY,
      APISECRET: this.options.apiSecret ?? process.env.BINANCE_API_SECRET,
      family: 4,
      log: (message: string) => this.logger.info(message)
    });
  }

  useServerTime(): Promise<any> {
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
      this.logger.debug('ws:user-data', message);

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

  userData2(handler: (message: any) => void) {
    return this.endpoint.websockets.userData(handler, handler);
  }

  account(): Promise<any> {
    return retry<any>(() => this.endpoint.account());
  }

  openOrders(symbol): Promise<any> {
    return retry<any>(() => this.endpoint.openOrders(symbol));
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
