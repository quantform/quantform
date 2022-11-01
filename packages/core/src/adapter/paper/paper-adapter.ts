import { assetOf, InstrumentSelector, Ohlc, Order } from '../../domain';
import { d, decimal, timestamp } from '../../shared';
import { BalanceLoadEvent, OrderNewEvent, Store } from '../../store';
import { Adapter } from '..';
import { AdapterFactory, FeedAsyncCallback } from '../adapter';
import { noPaperEngineProvidedError } from '../error';
import { PaperEngine } from './engine/paper-engine';

export interface PaperOptions {
  balance: { [key: string]: decimal };
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
  private engine?: PaperEngine;

  constructor(
    readonly decoratedAdapter: Adapter,
    readonly store: Store,
    readonly options: PaperOptions
  ) {
    super({
      timestamp: () => this.decoratedAdapter.timestamp()
    });
  }

  async awake(): Promise<void> {
    this.engine = this.createPaperEngine(this);

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

      this.store.dispatch(new BalanceLoadEvent(asset, free, d.Zero, this.timestamp()));
    }

    for (const missingAsset of subscribed) {
      this.store.dispatch(
        new BalanceLoadEvent(missingAsset, d.Zero, d.Zero, this.timestamp())
      );
    }
  }

  async open(order: Order): Promise<void> {
    if (!this.engine) {
      throw noPaperEngineProvidedError();
    }

    const { timestamp } = this.store.snapshot;

    this.store.dispatch(new OrderNewEvent(order, timestamp));

    this.engine.execute(order);
  }

  async cancel(order: Order): Promise<void> {
    if (!this.engine) {
      throw noPaperEngineProvidedError();
    }

    this.engine.cancel(order);
  }

  history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Ohlc[]> {
    return this.decoratedAdapter.history(instrument, timeframe, length);
  }

  feed(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    return this.decoratedAdapter.feed(instrument, from, to, callback);
  }

  createPaperEngine(adapter: PaperAdapter): PaperEngine {
    return this.decoratedAdapter.createPaperEngine(adapter);
  }
}
