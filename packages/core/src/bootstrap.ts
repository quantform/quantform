import {
  AdapterAggregate,
  BacktesterAdapter,
  BacktesterListener,
  BacktesterStreamer,
  PaperAdapter
} from './adapter';
import { Session, SessionDescriptor } from './domain';
import { Store } from './store';

export class Bootstrap {
  constructor(readonly descriptor: SessionDescriptor) {}

  /**
   * Set session id.
   * @param id session id.
   */
  useSessionId(id?: number): Bootstrap {
    if (id) {
      this.descriptor.id = id;
    }

    return this;
  }

  /**
   *
   * @param from
   * @param to
   */
  useBacktestPeriod(from?: number, to?: number): Bootstrap {
    if (!this.descriptor.simulation) {
      this.descriptor.simulation = {
        balance: {},
        from: undefined,
        to: undefined
      };
    }

    if (from) {
      this.descriptor.simulation.from = from;
    }

    if (to) {
      this.descriptor.simulation.to = to;
    }

    return this;
  }

  /**
   * Starts a new backtest session.
   * @param listener backtest event listener.
   * @returns new session object.
   */
  backtest(listener?: BacktesterListener): [Session, BacktesterStreamer] {
    const store = new Store();
    const { feed } = this.descriptor;

    const streamer = new BacktesterStreamer(
      store,
      feed,
      this.descriptor.simulation,
      listener
    );

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(
        it =>
          new BacktesterAdapter(
            new PaperAdapter(it, store, this.descriptor.simulation),
            streamer
          )
      ),
      store
    );

    const session = new Session(store, aggregate, this.descriptor);

    return [session, streamer];
  }

  /**
   * Starts a new paper session.
   * @returns new session object.
   */
  paper(): Session {
    if (!this.descriptor.simulation) {
      this.descriptor.simulation = {
        balance: {},
        from: undefined,
        to: undefined
      };
    }

    if (!this.descriptor.simulation.balance) {
      this.descriptor.simulation.balance = {};
    }

    const store = new Store();

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(
        it => new PaperAdapter(it, store, this.descriptor.simulation)
      ),
      store
    );

    return new Session(store, aggregate, this.descriptor);
  }

  /**
   * Starts a new live session.
   * @returns new session object.
   */
  live(): Session {
    const store = new Store();
    const aggregate = new AdapterAggregate(this.descriptor.adapter, store);

    return new Session(store, aggregate, this.descriptor);
  }
}
