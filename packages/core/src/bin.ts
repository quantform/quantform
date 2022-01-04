import {
  BacktesterAdapter,
  BacktesterListener,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate } from './adapter';
import { PaperAdapter } from './adapter/paper';
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
  listener?: BacktesterListener
): [Session, BacktesterStreamer] {
  const store = new Store();

  const streamer = new BacktesterStreamer(
    store,
    descriptor.feed,
    descriptor.options.backtester,
    listener
  );
  const aggregate = new AdapterAggregate(
    descriptor.adapter.map(
      it =>
        new PaperAdapter(
          new BacktesterAdapter(it, streamer),
          store,
          descriptor.options.backtester
        )
    ),
    store
  );

  return [new Session(store, aggregate, descriptor), streamer];
}

/**
 * Starts a new paper session.
 * @param descriptor session descriptor.
 * @param options backtest options.
 * @returns new session object.
 */
export function paper(descriptor: SessionDescriptor): Session {
  const store = new Store();

  const aggregate = new AdapterAggregate(
    descriptor.adapter.map(it => new PaperAdapter(it, store, descriptor.options.paper)),
    store
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
  const aggregate = new AdapterAggregate(descriptor.adapter, store);

  return new Session(store, aggregate, descriptor);
}
