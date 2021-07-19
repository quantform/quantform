import { timestamp } from '../common';

export interface AdapterContext {
  readonly name: string;

  timestamp(): timestamp;
}
