import { Session } from './session';
import { Store } from '../store';
import { ExchangeAdapterAggregate } from '../exchange-adapter';
import {
  ExchangeBacktesterAdapter,
  ExchangeBacktesterStreamer
} from '../exchange-backtester';
import { ExchangePaperTradingAdapter } from '../exchange-paper-trading';
import { SessionDescriptor } from './session.descriptor';

export class SessionFactory {
  static backtest(descriptor: SessionDescriptor, completed: () => void): Session {
    const store = new Store();
    const adapter = descriptor.adapter();
    const streamer = new ExchangeBacktesterStreamer(store, descriptor.options());

    const session = new Session(
      descriptor,
      store,
      new ExchangeAdapterAggregate(
        store,
        adapter.map(
          it =>
            new ExchangePaperTradingAdapter(
              new ExchangeBacktesterAdapter(it, streamer),
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
      new ExchangeAdapterAggregate(
        store,
        adapter.map(
          it => new ExchangePaperTradingAdapter(it, store, descriptor.options())
        )
      )
    );
  }

  static real(descriptor: SessionDescriptor): Session {
    const store = new Store();
    const adapter = descriptor.adapter();

    return new Session(descriptor, store, new ExchangeAdapterAggregate(store, adapter));
  }
}
