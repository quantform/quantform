import { AdapterContext, retry } from '@quantform/core';

import { binanceCacheKey } from './binance.mapper';

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

  async fetchInstruments(context: AdapterContext): Promise<any[]> {
    const response = await context.cache.tryGet(
      () => retry<any>(() => this.endpoint.exchangeInfo()),
      binanceCacheKey('exchange-info')
    );

    return response.symbols;
  }

  async cancel(order: { symbol: string; externalId: string }) {
    const response = await this.endpoint.cancel(order.symbol, order.externalId);

    if (response.statusCode == 400) {
      throw new Error(response.msg);
    }
  }
}
