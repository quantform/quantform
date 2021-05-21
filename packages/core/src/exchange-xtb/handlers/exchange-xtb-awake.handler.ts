import { Store } from '../../store';
import {
  ExchangeAdapterHandler,
  ExchangeAwakeRequest,
  ExchangeAdapterContext
} from '../../exchange-adapter';
import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';
import { InstrumentPatchEvent } from '../../store/event';
import { Logger } from '../../common';
import { Asset, Commision } from '../../domain';
import { ConnectionStatus } from 'xapi-node';

/**
 *
 */
export class ExchangeXtbAwakeHandler
  implements ExchangeAdapterHandler<ExchangeAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeXtbAdapter) {}

  async handle(
    request: ExchangeAwakeRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adapter.endpoint.onReady(async () => {
        await this.onConnectionReady(store, context);
        resolve();
      });
      this.adapter.endpoint.onReject(e => {
        this.onConnectionRejected(e);
        reject();
      });
      this.adapter.endpoint.onConnectionChange(e => {
        if (e == ConnectionStatus.DISCONNECTED && this.adapter.endpoint.tryReconnect) {
          Logger.info(`xtb reconnecting: ${ConnectionStatus[e]}`);

          this.adapter.endpoint.connect();
        }
      });

      this.adapter.endpoint.connect();
    });
  }

  private async onConnectionReady(
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    const response = await this.adapter.endpoint.Socket.send.getAllSymbols();

    const instruments = response.returnData.map(it => {
      const base = new Asset(it.symbol, this.adapter.name, it.tickSize);
      const quote = new Asset(it.currency, this.adapter.name, it.precision);
      const commision = new Commision(0.01, 0.01);

      return new InstrumentPatchEvent(
        context.timestamp(),
        base,
        quote,
        commision,
        it.symbol,
        it.leverage
      );
    });

    store.dispatch(...instruments);
  }

  private onConnectionRejected(error: any): void {
    Logger.info('xtb connection rejected');
  }
}
