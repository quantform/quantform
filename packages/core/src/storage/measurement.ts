import { provide, provider, timestamp } from '@lib/shared';
import {
  Storage,
  StorageFactory,
  storageFactoryToken,
  StorageQueryOptions
} from '@lib/storage';

export interface Measure {
  timestamp: timestamp;
  kind: string;
  payload: any;
}

/**
 *
 */
@provider()
export class Measurement {
  private readonly storage: Storage;

  constructor(@provide(storageFactoryToken) factory: StorageFactory) {
    this.storage = factory.for('measurement');
  }

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
