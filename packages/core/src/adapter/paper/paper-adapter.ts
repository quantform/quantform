import { Adapter, AdapterContext } from '..';
import { Store } from '../../store';
import { PaperExecutor } from './executor/paper-executor';
import { handler } from '../../shared/topic';
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
  readonly executor: PaperExecutor;

  constructor(
    readonly decoratedAdapter: Adapter,
    readonly store: Store,
    readonly options: PaperOptions
  ) {
    super();

    this.executor = this.createPaperExecutor(this);
  }

  timestamp() {
    return this.decoratedAdapter.timestamp();
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return this.decoratedAdapter.createPaperExecutor(adapter);
  }

  onUnknownEvent(event: { type: string }, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterAccountCommand)
  onAccount(event: AdapterAccountCommand, context: AdapterContext) {
    let subscribed = Object.values(this.store.snapshot.subscription.asset).filter(
      it => it.adapter == this.name
    );

    for (const balance in this.options.balance) {
      const asset = assetOf(balance);

      if (asset.adapter != this.name) {
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
    this.executor.open(event.order);

    return Promise.resolve();
  }

  @handler(AdapterOrderCancelCommand)
  onOrderCancel(event: AdapterOrderCancelCommand, context: AdapterContext) {
    this.executor.cancel(event.order);

    return Promise.resolve();
  }
}
