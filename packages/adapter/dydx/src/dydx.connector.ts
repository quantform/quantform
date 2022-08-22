import { DydxClient } from '@dydxprotocol/v3-client';
import { Logger, retry } from '@quantform/core';
import { EventEmitter, WebSocket } from 'ws';

import { DYDX_ADAPTER_NAME } from './dydx.adapter';

function subscriptionKey(channel: string, market: string) {
  return `${channel}:${market}`;
}

export class DyDxConnector {
  private static HTTP_HOST = 'https://api.dydx.exchange';
  private static WS_HOST = 'wss://api.dydx.exchange/v3/ws';
  private static RECONNECTION_TIMEOUT = 1000;

  private readonly client: DydxClient;
  private readonly emitter = new EventEmitter();
  private socket: WebSocket;
  private subscriptions: Record<string, any> = {};
  private reconnectionTimeout: any;

  constructor(private readonly host?: { http: string; ws: string }) {
    this.client = new DydxClient(host?.http ?? DyDxConnector.HTTP_HOST);
  }

  dispose() {
    if (this.socket && this.socket.readyState == this.socket.OPEN) {
      this.socket.terminate();
      this.socket = undefined;
    }
  }

  reconnect() {
    this.dispose();
    this.tryEnsureSocketConnection();
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
    if (this.socket || this.reconnectionTimeout) {
      return;
    }

    const reconnect = () => {
      if (this.reconnectionTimeout) {
        return;
      }

      Logger.info(
        DYDX_ADAPTER_NAME,
        `socket connection down, reconnecting in ${DyDxConnector.RECONNECTION_TIMEOUT}ms.`
      );

      this.socket.close();
      this.socket = undefined;

      this.reconnectionTimeout = setTimeout(() => {
        this.reconnectionTimeout = undefined;
        this.tryEnsureSocketConnection();
      }, DyDxConnector.RECONNECTION_TIMEOUT);
    };

    this.socket = new WebSocket(this.host?.ws ?? DyDxConnector.WS_HOST);
    this.socket
      .on('close', reconnect)
      .on('error', reconnect)
      .on('open', () => {
        Logger.info(DYDX_ADAPTER_NAME, `socket connected!`);

        Object.values(this.subscriptions).forEach(it =>
          this.socket.send(JSON.stringify(it))
        );
      })
      .on('message', it => {
        const payload = JSON.parse(it.toString());

        this.emitter.emit(payload.channel, payload);
      });
  }

  trades(market: string, handler: (message: any) => void) {
    this.emitter.on('v3_trades', it => {
      if (it.id == market) {
        handler(it);
      }
    });

    this.subscribe('v3_trades', market);
  }

  orderbook(market: string, handler: (message: any) => void) {
    this.emitter.on('v3_orderbook', it => {
      if (it.id == market) {
        handler(it);
      }
    });

    this.subscribe('v3_orderbook', market);
  }

  subscribe(channel: string, market: string) {
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

    this.socket.on('open', () => this.socket.send(JSON.stringify(subscription)));
  }
}
