import { Adapter } from '../adapter';
import { Session } from '.';
import { Measurement } from '../storage/measurement';
import { Feed } from '../storage';
import { Behaviour } from '../behaviour';
import { Observable } from 'rxjs';

export interface SessionDescriptor {
  id: number;

  // provides trading adapters.
  adapter: Adapter[];

  // provides input and output feed for backtesting purposes.
  feed?: Feed;

  // defines measurement storage.
  measurement?: Measurement;

  behaviour?: Behaviour | Behaviour[] | ((session: Session) => Observable<any>);
}
