import { Adapter } from '../adapter';
import { Session } from '.';
import { Measurement } from '../storage/measurement';
import { Feed } from '../storage';
import { Observable } from 'rxjs';

/**
 * Describes a single session.
 * You can use @run function to start a new session managed by CLI.
 * To start managed session you should install @quantform/cli package and run
 * specific command:
 *  - qf paper (to paper trade strategy)
 *  - qf backtest (to backtest strategy based on provided feed)
 *  - qf live (to live trade strategy)
 * or run on your own in code:
 *  - paper(descriptor, options)
 *  - backtest(descriptor, options)
 *  - live(descriptor)
 */
export interface SessionDescriptor {
  /**
   * Unique session identifier, used to identify session in the storage.
   * You can generate new id every time you start the new session or provide
   * session id explicitly to resume previous session (in code or via CLI).
   * If you don't provide session id, it will generate new one based on time.
   */
  id?: number;

  /**
   * Collection of adapters used to connect to the exchanges.
   */
  adapter: Adapter[];

  /**
   * Provides historical data for backtest, it's not required for live and paper
   * sessions.
   */
  feed?: Feed;

  /**
   * Stores session variables i.e. indicators, orders, or any other type of time
   * series data. You can install @quantform/editor to render this data in your browser.
   */
  measurement?: Measurement;

  /**
   * Describes your trading strategy.
   */
  describe?: (session: Session) => Observable<any>;
}
