import { timestamp } from '../common';

export interface ExchangeAdapterContext {
  readonly name: string;

  timestamp(): timestamp;
}
