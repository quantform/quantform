import { Adapter, AdapterContext } from '..';
import { Store } from '../../store';
import { PaperModel } from './model/paper-model';
import { handler } from '../../common/topic';
import { assetOf } from '../../domain';
import { BalancePatchEvent } from '../../store/event';
import {
  AdapterAccountCommand,
  AdapterOrderOpenCommand,
  AdapterOrderCancelCommand
} from '../adapter.event';

export class PaperOptions {
  balance: { [key: string]: number };
}

export class PaperAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;
  readonly platform: PaperModel;

  constructor(
    readonly decoratedAdapter: Adapter,
    readonly store: Store,
    readonly options: PaperOptions
  ) {
    super();

    this.platform = this.createPaperModel(this);
  }

  timestamp() {
    return this.decoratedAdapter.timestamp();
  }

  createPaperModel(adapter: PaperAdapter): PaperModel {
    return this.decoratedAdapter.createPaperModel(adapter);
  }

  onUnknownEvent(event: { type: string }, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterAccountCommand)
  onAccount(event: AdapterAccountCommand, context: AdapterContext) {
    let subscribed = Object.values(this.store.snapshot.subscription.asset).filter(
      it => it.exchange == this.name
    );

    for (const balance in this.options.balance) {
      const asset = assetOf(balance);

      if (asset.exchange != this.name) {
        continue;
      }

      const free = this.options.balance[balance];

      subscribed = subscribed.filter(it => it.toString() != asset.toString());

      this.store.dispatch(new BalancePatchEvent(asset, free, 0, context.timestamp));
    }

    for (const missingAsset of subscribed) {
      this.store.dispatch(new BalancePatchEvent(missingAsset, 0, 0, context.timestamp));
    }
  }

  @handler(AdapterOrderOpenCommand)
  onOrderOpen(event: AdapterOrderOpenCommand, context: AdapterContext) {
    return this.platform.open(event.order);
  }

  @handler(AdapterOrderCancelCommand)
  onOrderCancel(event: AdapterOrderCancelCommand, context: AdapterContext) {
    return this.platform.cancel(event.order);
  }
}
