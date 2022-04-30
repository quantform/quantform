import { timestamp } from '../shared';

export interface Component {
  id: string;
  kind: string;
  timestamp: timestamp;
}
