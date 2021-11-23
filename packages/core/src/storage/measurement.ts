import { timestamp } from '../common';

export interface Measure {
  timestamp: timestamp;
  type: string;
  payload: any;
}

export interface Measurement {
  index(): Promise<Array<number>>;

  query(
    session: number,
    options: {
      timestamp: timestamp;
      type?: string;
      limit: number;
      direction: 'FORWARD' | 'BACKWARD';
    }
  ): Promise<Measure[]>;

  save(session: number, measurements: Measure[]): Promise<void>;
}
