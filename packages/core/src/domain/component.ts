import { timestamp } from '@lib/shared';

export interface Component {
  readonly type: number;
  readonly timestamp: timestamp;
}
