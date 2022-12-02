import { timestamp } from '@lib/shared';
import { State, StateChangeTracker } from '@lib/store';

export interface StoreEvent {
  timestamp: timestamp;

  handle(state: State, changes: StateChangeTracker): void;
}
