import { Session } from './session';
import { Store } from '../store';
import { AdapterAggregate } from '../adapter';
import {
  BacktesterAdapter,
  BacktesterOptions,
  BacktesterStreamer
} from '../adapter/backtester';
import { PaperAdapter, PaperOptions } from '../adapter/paper';
import { SessionDescriptor } from './session.descriptor';

export class SessionFactory {
  static backtest(descriptor: SessionDescriptor, options: BacktesterOptions): Session {
    const store = new Store();
    const adapter = descriptor.adapter();
    const feed = descriptor.feed();
    const streamer = new BacktesterStreamer(store, feed, options);

    const session = new Session(
      descriptor,
      store,
      new AdapterAggregate(
        store,
        adapter.map(
          it => new PaperAdapter(new BacktesterAdapter(it, streamer), store, options)
        )
      )
    );

    return session;
  }

  static paper(descriptor: SessionDescriptor, options: PaperOptions): Session {
    const store = new Store();
    const adapter = descriptor.adapter();

    return new Session(
      descriptor,
      store,
      new AdapterAggregate(
        store,
        adapter.map(it => new PaperAdapter(it, store, options))
      )
    );
  }

  static real(descriptor: SessionDescriptor): Session {
    const store = new Store();
    const adapter = descriptor.adapter();

    return new Session(descriptor, store, new AdapterAggregate(store, adapter));
  }
}
