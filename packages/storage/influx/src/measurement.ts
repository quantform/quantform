import { timestamp } from '@quantform/core';

export interface Measurement {
  timestamp: timestamp;
  fields: { [name: string]: any };
  tags: { [name: string]: any };
}
