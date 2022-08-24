import { DydxClient } from '@dydxprotocol/v3-client';
import { Logger, retry } from '@quantform/core';
import { EventEmitter, WebSocket } from 'ws';

import { DYDX_ADAPTER_NAME } from './dydx.adapter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

function subscriptionKey(channel: string, market: string) {
  return `${channel}:${market}`;
}

export class DyDxConnector {
  private static RECONNECTION_TIMEOUT = 1000;
  private static KEEP_ALIVE_TIMEOUT = 1000 * 35;

  private readonly web3 = new Web3();
  private readonly client: DydxClient;
  private readonly emitter = new EventEmitter();
  private socket: WebSocket;
  private subscriptions: Record<string, any> = {};
  private reconnectionTimeout: any;
  private keepAliveTimeout: any;

  constructor(private readonly options: { http: string; ws: string; networkId: number }) {
    this.web3.eth.accounts.wallet.add(process.env.QF_DXDY_ETH_PRIVATE_KEY);

    this.client = new DydxClient(options.http, {
      web3: this.web3,
      networkId: options.networkId
    });
  }

  async onboard() {
    const credentials = await this.client.onboarding.recoverDefaultApiCredentials(
      process.env.QF_DXDY_ETH_ADDRESS
    );

    this.client.apiKeyCredentials = credentials;
  }

  dispose() {
    clearTimeout(this.keepAliveTimeout);

    if (this.socket && this.socket.readyState == this.socket.OPEN) {
      this.socket.terminate();
      this.socket = undefined;
    }
  }

  getAccount() {
    return this.client.private.getAccount(process.env.QF_DXDY_ETH_ADDRESS);
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

      if (this.keepAliveTimeout) {
        clearTimeout(this.keepAliveTimeout);
      }

      Logger.error(
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

    this.socket = new WebSocket(this.options.ws);
    this.socket
      .on('close', reconnect)
      .on('error', reconnect)
      .on('ping', () => {
        if (this.keepAliveTimeout) {
          clearTimeout(this.keepAliveTimeout);
        }

        this.keepAliveTimeout = setTimeout(
          () => reconnect(),
          DyDxConnector.KEEP_ALIVE_TIMEOUT
        );
      })
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
