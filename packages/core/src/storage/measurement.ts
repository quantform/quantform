import { timestamp } from '../shared';
import { Storage, StorageQueryOptions } from './storage';

export interface Measure {
  timestamp: timestamp;
  kind: string;
  payload: any;
}

/**
 *
 */
export class Measurement {
  constructor(private readonly storage: Storage) {}

  /**
   *
   * @returns
   */
  async index(): Promise<Array<number>> {
    return (await this.storage.index()).map(it => Number(it));
  }

  /**
   *
   * @param session
   * @param measurements
   * @returns
   */
  save(session: number, measurements: Measure[]): Promise<void> {
    return this.storage.save(
      session.toString(),
      measurements.map(it => ({
        timestamp: it.timestamp,
        kind: it.kind,
        json: JSON.stringify(it.payload)
      }))
    );
  }

  /**
   *
   * @param session
   * @param options
   * @returns
   */
  async query(session: number, options: StorageQueryOptions): Promise<Measure[]> {
    const rows = await this.storage.query(session.toString(), options);

    return rows.map(it => ({
      timestamp: it.timestamp,
      kind: it.kind,
      payload: JSON.parse(it.json)
    }));
  }
}
