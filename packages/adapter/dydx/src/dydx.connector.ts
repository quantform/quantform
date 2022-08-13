import { DydxClient } from '@dydxprotocol/v3-client';
import { retry } from '@quantform/core';
import { EventEmitter, WebSocket } from 'ws';

function subscriptionKey(channel: string, market: string) {
  return `${channel}:${market}`;
}

export class DyDxConnector {
  private static HTTP_HOST = 'https://api.dydx.exchange';
  private static WS_HOST = 'wss://api.dydx.exchange/v3/ws';

  private readonly client: DydxClient;
  private readonly emitter = new EventEmitter();
  private socket: WebSocket;
  private subscriptions: Record<string, any> = {};

  constructor(private readonly host?: { http: string; ws: string }) {
    this.client = new DydxClient(host?.http ?? DyDxConnector.HTTP_HOST);
  }

  dispose() {
    if (this.socket && this.socket.readyState == this.socket.OPEN) {
      this.socket.terminate();
    }
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

  private tryEnsureSocketConnection() {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(this.host?.ws ?? DyDxConnector.WS_HOST);
  }

  trades(market: string, handler: (message: any) => void) {
    this.subscribe('v3_trades', market, handler);
  }

  orderbook(market: string, handler: (message: any) => void) {
    this.subscribe('v3_orderbook', market, handler);
  }

  subscribe(channel: string, market: string, handler: (message: any) => void) {
    if (subscriptionKey(channel, market) in this.subscriptions) {
      throw new Error(`Already subscribed for ${channel} on ${market}`);
    }

    this.tryEnsureSocketConnection();

    const subscription = {
      type: 'subscribe',
      channel,
      id: market,
      includeOffsets: true
    };

    this.subscriptions[subscriptionKey(channel, market)] = subscription;

    this.socket
      .on('open', () => this.socket.send(JSON.stringify(subscription)))
      .on('close', () => console.log('close'))
      .on('error', () => console.log('error'))
      .on('message', it => {
        const payload = JSON.parse(it.toString());

        if (payload.id == market && payload.channel == channel) {
          handler(payload);
        }
      });
  }
}
