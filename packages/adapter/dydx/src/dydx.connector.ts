import { DydxClient } from '@dydxprotocol/v3-client';
import { retry } from '@quantform/core';

export class DyDxConnector {
  private static HTTP_HOST = 'https://api.dydx.exchange';
  private static WS_HOST = 'wss://api.dydx.exchange/v3/ws';

  private readonly client: DydxClient;

  constructor(private readonly host?: { http: string; ws: string }) {
    this.client = new DydxClient(host?.http ?? DyDxConnector.HTTP_HOST);
  }

  async getMarkets() {
    return retry(() => this.client.public.getMarkets());
  }

  getTrades(market: string, startingBeforeOrAt: number) {
    return this.client.public.getTrades({
      market: market as any,
      startingBeforeOrAt: new Date(startingBeforeOrAt).toISOString()
    });
  }
}
