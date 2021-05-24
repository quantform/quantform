import { Session } from './session';
import { Store } from '../store';
import { AdapterAggregate } from '../adapter';
import { BacktesterAdapter, BacktesterStreamer } from '../adapter/backtester';
import { PaperAdapter } from '../adapter/paper';
import { SessionDescriptor } from './session.descriptor';

export class SessionFactory {
  static backtest(descriptor: SessionDescriptor, completed: () => void): Session {
    const store = new Store();
    const adapter = descriptor.adapter();
    const streamer = new BacktesterStreamer(store, descriptor.options());

    const session = new Session(
      descriptor,
      store,
      new AdapterAggregate(
        store,
        adapter.map(
          it =>
            new PaperAdapter(
              new BacktesterAdapter(it, streamer),
              store,
              descriptor.options()
            )
        )
      )
    );

    streamer.completed = completed;

    return session;
  }

  static paper(descriptor: SessionDescriptor): Session {
    const store = new Store();
    const adapter = descriptor.adapter();

    return new Session(
      descriptor,
      store,
      new AdapterAggregate(
        store,
        adapter.map(it => new PaperAdapter(it, store, descriptor.options()))
      )
    );
  }

  static real(descriptor: SessionDescriptor): Session {
    const store = new Store();
    const adapter = descriptor.adapter();

    return new Session(descriptor, store, new AdapterAggregate(store, adapter));
  }
}
