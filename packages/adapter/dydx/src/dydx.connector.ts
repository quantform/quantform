import { DydxClient } from '@dydxprotocol/v3-client';
import { RequestMethod } from '@dydxprotocol/v3-client/build/src/lib/axios';
import { Logger, retry } from '@quantform/core';
import { now } from 'lodash';
import { EventEmitter, WebSocket } from 'ws';

import { DYDX_ADAPTER_NAME } from './dydx.adapter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

function subscriptionKey(channel: string, market: string) {
  return `${channel}:${market}`;
}

export class DyDxConnector {
  private static RECONNECTION_TIMEOUT = 1000;
  private static PING_TIMEOUT = 1000 * 5;

  private readonly web3 = new Web3();
  private readonly client: DydxClient;
  private readonly emitter = new EventEmitter();
  private socket: WebSocket;
  private subscriptions: Record<string, any> = {};
  private reconnectionTimeout: any;
  private pingInterval: any;
  private lastMessageTimestamp: number;

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
    clearInterval(this.pingInterval);

    if (this.socket && this.socket.readyState == this.socket.OPEN) {
      this.socket.terminate();
      this.socket = undefined;
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
    if (this.socket || this.reconnectionTimeout) {
      return;
    }

    const reconnect = () => {
      if (this.reconnectionTimeout) {
        return;
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
      .on('pong', () => (this.lastMessageTimestamp = now()))
      .on('ping', () => (this.lastMessageTimestamp = now()))
      .on('open', () => {
        Logger.info(DYDX_ADAPTER_NAME, `socket connected!`);

        if (this.pingInterval) {
          clearInterval(this.pingInterval);
        }

        this.lastMessageTimestamp = now();

        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            this.socket.ping();
          }
        }, DyDxConnector.PING_TIMEOUT);

        Object.values(this.subscriptions).forEach(it =>
          this.socket.send(JSON.stringify(it))
        );
      })
      .on('message', it => {
        const timestamp = now();

        if (this.lastMessageTimestamp + DyDxConnector.PING_TIMEOUT * 2 < timestamp) {
          reconnect();
        } else {
          this.lastMessageTimestamp = timestamp;

          const payload = JSON.parse(it.toString());

          this.emitter.emit(payload.channel, payload);
        }
      });
  }

  async account(handler: (message: any) => void) {
    const { account } = await this.client.private.getAccount(
      process.env.QF_DXDY_ETH_ADDRESS
    );

    const timestamp = new Date().toISOString();
    const signature = this.client.private.sign({
      requestPath: '/ws/accounts',
      method: RequestMethod.GET,
      isoTimestamp: timestamp
    });

    this.emitter.on('v3_accounts', handler);

    this.subscribe({
      type: 'subscribe',
      channel: 'v3_accounts',
      accountNumber: account.accountNumber,
      apiKey: this.client.apiKeyCredentials.key,
      passphrase: this.client.apiKeyCredentials.passphrase,
      signature,
      timestamp
    });
  }

  trades(market: string, handler: (message: any) => void) {
    this.emitter.on('v3_trades', it => {
      if (it.id == market) {
        handler(it);
      }
    });

    this.subscribe({
      type: 'subscribe',
      channel: 'v3_trades',
      id: market,
      includeOffsets: true
    });
  }

  orderbook(market: string, handler: (message: any) => void) {
    this.emitter.on('v3_orderbook', it => {
      if (it.id == market) {
        handler(it);
      }
    });

    this.subscribe({
      type: 'subscribe',
      channel: 'v3_orderbook',
      id: market,
      includeOffsets: true
    });
  }

  subscribe(subscription: { channel: string; market: string } & any) {
    const key = subscriptionKey(subscription.channel, subscription.market);

    if (key in this.subscriptions) {
      throw new Error(
        `Already subscribed for ${subscription.channel} on ${subscription.market}`
      );
    }

    this.tryEnsureSocketConnection();

    this.subscriptions[key] = subscription;

    this.socket.on('open', () => this.socket.send(JSON.stringify(subscription)));
  }
}
