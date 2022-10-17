import { timestamp } from '../shared';
import { State, StateChangeTracker } from './store-state';

export interface StoreEvent {
  timestamp: timestamp;

  handle(state: State, changes: StateChangeTracker): void;
}
