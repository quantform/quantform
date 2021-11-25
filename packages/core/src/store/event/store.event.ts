import { timestamp } from '../../shared';

export interface StoreEvent {
  type: string;
  timestamp: timestamp;
}
