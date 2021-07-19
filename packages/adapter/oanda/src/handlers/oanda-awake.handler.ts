import {
  Asset,
  commisionPercentOf,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  Store
} from '@quantform/core';
import { OandaAdapter } from '../oanda.adapter';

export class OandaAwakeHandler implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: OandaAdapter) {}

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    const response = await new Promise(resolve => {
      this.adapter.http.account.instruments(this.adapter.accountId, {}, response =>
        resolve(response.body)
      );
    });

    store.dispatch(
      ...(response['instruments'] as any[]).map(it => this.map(it, context))
    );
  }

  map(asset: any, context: AdapterContext): InstrumentPatchEvent {
    const base = new Asset(
      asset.name.split('_')[0].toLowerCase(),
      this.adapter.name,
      parseInt(asset.tradeUnitsPrecision)
    );
    const quote = new Asset(
      asset.name.split('_')[1].toLowerCase(),
      this.adapter.name,
      parseInt(asset.displayPrecision)
    );

    return new InstrumentPatchEvent(
      context.timestamp(),
      base,
      quote,
      commisionPercentOf(0.1, 0.1),
      asset.name
    );
  }
}
