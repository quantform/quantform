import { Adapter } from '../adapter';
import { Session } from '.';
import { Measurement } from '../storage/measurement';
import { Feed } from '../storage';
import { Behaviour } from '../behaviour';
import { Observable } from 'rxjs';

export interface SessionDescriptor {
  /**
   * defines supported adapters by this strategy.
   */
  adapter: Adapter[];

  /**
   * defines input and output feed for backtesting purposes.
   */

  feed?: Feed;

  /**
   * defines measurement storage.
   */
  measurement?: Measurement;

  template?: string;

  behaviour?: Behaviour | Behaviour[] | ((session: Session) => Observable<any>);
}
