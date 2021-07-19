import { XtbAdapter } from '../xtb-adapter';
import { ConnectionStatus } from 'xapi-node';
import {
  Asset,
  Commision,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  Logger,
  Store
} from '@quantform/core';

export class XtbAwakeHandler implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: XtbAdapter) {}

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
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

  private async onConnectionReady(store: Store, context: AdapterContext): Promise<void> {
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
