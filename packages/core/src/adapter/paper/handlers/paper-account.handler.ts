import { assetOf } from '../../../domain';
import { Store } from '../../../store';
import { AdapterAccountRequest } from '../../adapter-request';
import { AdapterContext, AdapterHandler } from '../..';
import { BalancePatchEvent } from '../../../store/event';
import { PaperAdapter } from '../paper-adapter';

export class PaperAccountHandler implements AdapterHandler<AdapterAccountRequest, void> {
  constructor(private readonly adapter: PaperAdapter) {}

  async handle(
    request: AdapterAccountRequest,
    store: Store,
    context: AdapterContext
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
