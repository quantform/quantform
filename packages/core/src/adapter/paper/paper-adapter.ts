import { Adapter, AdapterContext } from '..';
import { Store } from '../../store';
import { PaperExecutor } from './executor/paper-executor';
import { assetOf, Candle, InstrumentSelector, Order } from '../../domain';
import { BalancePatchEvent } from '../../store/event';
import { Feed } from 'src/storage';
import { FeedQuery, HistoryQuery } from '../adapter';

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

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await this.decoratedAdapter.awake(context);
  }

  dispose(): Promise<void> {
    return this.decoratedAdapter.dispose();
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return this.decoratedAdapter.subscribe(instruments);
  }

  async account(): Promise<void> {
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

      this.store.dispatch(new BalancePatchEvent(asset, free, 0, this.context.timestamp));
    }

    for (const missingAsset of subscribed) {
      this.store.dispatch(
        new BalancePatchEvent(missingAsset, 0, 0, this.context.timestamp)
      );
    }
  }

  async open(order: Order): Promise<void> {
    this.executor.open(order);
  }

  async cancel(order: Order): Promise<void> {
    this.executor.cancel(order);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return this.decoratedAdapter.history(query);
  }

  feed(query: FeedQuery): Promise<void> {
    return this.decoratedAdapter.feed(query);
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return this.decoratedAdapter.createPaperExecutor(adapter);
  }
}
