import { timestamp } from '../../common';

export interface StoreEvent {
  type: string;
  timestamp: timestamp;
}
