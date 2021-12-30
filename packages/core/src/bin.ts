import {
  BacktesterAdapter,
  BacktesterOptions,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate } from './adapter';
import { PaperAdapter, PaperOptions } from './adapter/paper';
import { Session, SessionDescriptor } from './session';
import { Store } from './store';

/**
 * Starts a new backtest session.
 * @param descriptor session descriptor.
 * @param options backtest options.
 * @returns new session object.
 */
export function backtest(
  descriptor: SessionDescriptor,
  options: BacktesterOptions
): [Session, BacktesterStreamer] {
  const store = new Store();

  const streamer = new BacktesterStreamer(store, descriptor.feed, options);
  const aggregate = new AdapterAggregate(
    store,
    descriptor.adapter.map(
      it => new PaperAdapter(new BacktesterAdapter(it, streamer), store, options)
    )
  );

  return [new Session(store, aggregate, descriptor), streamer];
}

/**
 * Starts a new paper session.
 * @param descriptor session descriptor.
 * @param options backtest options.
 * @returns new session object.
 */
export function paper(descriptor: SessionDescriptor, options: PaperOptions): Session {
  const store = new Store();

  const aggregate = new AdapterAggregate(
    store,
    descriptor.adapter.map(it => new PaperAdapter(it, store, options))
  );

  return new Session(store, aggregate, descriptor);
}

/**
 * Starts a new live session.
 * @param descriptor session descriptor.
 * @returns new session object.
 */
export function live(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const aggregate = new AdapterAggregate(store, descriptor.adapter);

  return new Session(store, aggregate, descriptor);
}
