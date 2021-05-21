import { assetOf } from '../../domain';
import { Store } from '../../store';
import { ExchangeAccountRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { BalancePatchEvent } from '../../store/event';
import { ExchangePaperTradingAdapter } from '../exchange-paper-trading-adapter';

export class ExchangePaperTradingAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void> {
  constructor(private readonly adapter: ExchangePaperTradingAdapter) {}

  async handle(
    request: ExchangeAccountRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    let subscribed = Object.values(store.snapshot.subscription.asset).filter(
      it => it.exchange == context.name
    );

    for (const balance in this.adapter.options.balance) {
      const asset = assetOf(balance);

      if (asset.exchange != context.name) {
        continue;
      }

      const free = this.adapter.options.balance[balance];

      subscribed = subscribed.filter(it => it.toString() != asset.toString());

      store.dispatch(new BalancePatchEvent(asset, free, 0, context.timestamp()));
    }

    for (const missingAsset of subscribed) {
      store.dispatch(new BalancePatchEvent(missingAsset, 0, 0, context.timestamp()));
    }
  }
}
