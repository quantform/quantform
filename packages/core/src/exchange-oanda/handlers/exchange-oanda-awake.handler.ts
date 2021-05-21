import { Asset } from '../../domain';
import { commisionPercentOf } from '../../domain/commision';
import { ExchangeAwakeRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { ExchangeOandaAdapter } from '../exchange-oanda.adapter';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { InstrumentPatchEvent } from '../../store/event';

export class ExchangeOandaAwakeHandler
  implements ExchangeAdapterHandler<ExchangeAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeOandaAdapter) {}

  async handle(
    request: ExchangeAwakeRequest,
    store: Store,
    context: ExchangeAdapterContext
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

  map(asset: any, context: ExchangeAdapterContext): InstrumentPatchEvent {
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
