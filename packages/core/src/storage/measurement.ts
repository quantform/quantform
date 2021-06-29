import { timestamp } from '../common';

export interface Measure {
  timestamp: timestamp;
  type: string;

  [key: string]: any;
}

export interface Measurement {
  index(): Promise<Array<number>>;

  read(
    session: number,
    timestamp: timestamp,
    direction: 'FORWARD' | 'BACKWARD'
  ): Promise<Measure[]>;

  write(session: number, measurements: Measure[]): Promise<void>;
}
