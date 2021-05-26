import { timestamp } from '../common';

export interface Measure {
  timestamp: timestamp;
  type: string;

  [key: string]: any;
}

export interface Measurement {
  read(
    session: string,
    timestamp: number,
    direction: 'FORWARD' | 'BACKWARD'
  ): Promise<Measure[]>;
  write(session: string, measurements: Measure[]): Promise<void>;
}
