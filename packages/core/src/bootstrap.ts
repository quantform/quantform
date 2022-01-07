import {
  BacktesterAdapter,
  BacktesterListener,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate } from './adapter';
import { PaperAdapter } from './adapter/paper';
import { Session, SessionDescriptor } from './session';
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
    if (from) {
      this.descriptor.options.backtester.from = from;
    }

    if (to) {
      this.descriptor.options.backtester.to = to;
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
    const { backtester } = this.descriptor.options;

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(
        it => new PaperAdapter(new BacktesterAdapter(it, streamer), store, backtester)
      ),
      store
    );

    const session = new Session(store, aggregate, this.descriptor);
    const streamer = new BacktesterStreamer(
      session.worker,
      store,
      feed,
      backtester,
      listener
    );

    return [session, streamer];
  }

  /**
   * Starts a new paper session.
   * @returns new session object.
   */
  paper(): Session {
    if (!this.descriptor.options) {
      this.descriptor.options = {};
    }

    if (!this.descriptor.options.paper) {
      this.descriptor.options.paper = {
        balance: {}
      };
    }

    const store = new Store();
    const { paper } = this.descriptor.options;

    const aggregate = new AdapterAggregate(
      this.descriptor.adapter.map(it => new PaperAdapter(it, store, paper)),
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
