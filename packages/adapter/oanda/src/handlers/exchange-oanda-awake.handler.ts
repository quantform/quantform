import {
  Asset,
  commisionPercentOf,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  Store
} from '@quantform/core';
import { ExchangeOandaAdapter } from '../exchange-oanda.adapter';

export class ExchangeOandaAwakeHandler
  implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeOandaAdapter) {}

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
