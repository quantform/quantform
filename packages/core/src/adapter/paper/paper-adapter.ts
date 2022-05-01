import { assetOf, Candle, InstrumentSelector, Order } from '../../domain';
import { BalancePatchEvent, Store } from '../../store';
import { Adapter } from '..';
import { AdapterFactory, FeedQuery, HistoryQuery } from '../adapter';
import { PaperSimulator } from './simulator/paper-simulator';

export interface PaperOptions {
  balance: { [key: string]: number };
}

export function createPaperAdapterFactory(
  decoratedAdapterFactory: AdapterFactory,
  options: PaperOptions
): AdapterFactory {
  return (timeProvider, store, cache) =>
    new PaperAdapter(decoratedAdapterFactory(timeProvider, store, cache), store, options);
}

export class PaperAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;
  readonly simulator: PaperSimulator;

  constructor(
    readonly decoratedAdapter: Adapter,
    readonly store: Store,
    readonly options: PaperOptions
  ) {
    super({
      timestamp: () => this.decoratedAdapter.timestamp()
    });

    this.simulator = this.createPaperSimulator(this);
  }

  async awake(): Promise<void> {
    await this.decoratedAdapter.awake();
  }

  dispose(): Promise<void> {
    return this.decoratedAdapter.dispose();
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return this.decoratedAdapter.subscribe(instruments);
  }

  async account(): Promise<void> {
    let subscribed = Object.values(this.store.snapshot.subscription.asset).filter(
      it => it.adapterName == this.name
    );

    for (const balance in this.options.balance) {
      const asset = assetOf(balance);

      if (asset.adapterName != this.name) {
        continue;
      }

      const free = this.options.balance[balance];

      subscribed = subscribed.filter(it => it.id != asset.id);

      this.store.dispatch(new BalancePatchEvent(asset, free, 0, this.timestamp()));
    }

    for (const missingAsset of subscribed) {
      this.store.dispatch(new BalancePatchEvent(missingAsset, 0, 0, this.timestamp()));
    }
  }

  async open(order: Order): Promise<void> {
    this.simulator.open(order);
  }

  async cancel(order: Order): Promise<void> {
    this.simulator.cancel(order);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return this.decoratedAdapter.history(query);
  }

  feed(query: FeedQuery): Promise<void> {
    return this.decoratedAdapter.feed(query);
  }

  createPaperSimulator(adapter: PaperAdapter): PaperSimulator {
    return this.decoratedAdapter.createPaperSimulator(adapter);
  }
}
