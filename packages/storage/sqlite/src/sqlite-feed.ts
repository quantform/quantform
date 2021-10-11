import { Feed, InstrumentSelector, workingDirectory, StoreEvent } from '@quantform/core';
import { Statement } from 'sqlite3';
import { join } from 'path';
import { SQLiteConnection } from './sqlite-connection';

type InstrumentEvent = StoreEvent & { instrument: InstrumentSelector };

export class SQLiteReadRequest {
  constructor(
    readonly name: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: number,
    readonly payload: any
  ) {}
}

export class SQLiteFeed extends SQLiteConnection implements Feed {
  private readonly statement: {
    read: Record<string, Statement>;
    write: Record<string, Statement>;
  } = {
    read: {},
    write: {}
  };

  private async tryCreateTable(instrument: InstrumentSelector): Promise<void> {
    await new Promise<void>(async resolve => {
      this.connection.run(
        `
      CREATE TABLE IF NOT EXISTS "${instrument.toString()}" (
        timestamp INTEGER NOT NULL, 
        type TEXT NOT NULL, 
        json TEXT NOT NULL, 
        PRIMARY KEY (timestamp, type)
      )`,
        error => {
          if (error) {
            throw new Error(error.message);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async read(
    instrument: InstrumentSelector,
    from: number,
    to: number
  ): Promise<(InstrumentEvent & any)[]> {
    await this.tryConnect();

    if (!this.statement.read[instrument.toString()]) {
      await this.tryCreateTable(instrument);

      this.statement.read[instrument.toString()] = this.connection.prepare(
        `SELECT * FROM "${instrument.toString()}"
         WHERE timestamp > ? AND timestamp <= ?
         ORDER BY timestamp
         LIMIT ?`
      );
    }

    const limit = Math.max(0, this.options?.limit ?? 50000);

    return await new Promise<InstrumentEvent[]>(async resolve => {
      this.statement.read[instrument.toString()].all(
        [from, to, limit],
        async (error, rows) => {
          if (error) {
            throw new Error(error.message);
          } else {
            resolve(
              rows
                .map(it => this.deserialize(instrument, it.timestamp, it.type, it.json))
                .filter(it => it)
            );
          }
        }
      );
    });
  }

  async write(instrument: InstrumentSelector, events: InstrumentEvent[]): Promise<void> {
    await this.tryConnect();

    if (!this.statement.write[instrument.toString()]) {
      await this.tryCreateTable(instrument);

      this.statement.write[instrument.toString()] = this.connection.prepare(`
        REPLACE INTO "${instrument.toString()}" (timestamp, type, json)
        VALUES(?, ?, ?); 
      `);
    }

    for (const event of events) {
      const serialized = this.serialize(event);
      if (!serialized) {
        continue;
      }

      await new Promise<void>(async resolve => {
        this.statement.write[instrument.toString()].run(
          [serialized.timestamp, serialized.type, serialized.json],
          error => {
            if (error) {
              throw new Error(error.message);
            } else {
              resolve();
            }
          }
        );
      });
    }
  }

  private serialize(event: InstrumentEvent): {
    timestamp: number;
    type: string;
    json: string;
  } {
    return {
      timestamp: event.timestamp,
      type: event.type,
      json: JSON.stringify(event, (key, value) =>
        key != 'timestamp' && key != 'type' && key != 'instrument' ? value : undefined
      )
    };
  }

  private deserialize(
    instrument: InstrumentSelector,
    timestamp: number,
    type: string,
    json: string
  ): InstrumentEvent {
    const payload = JSON.parse(json);

    return {
      type,
      timestamp,
      instrument,
      ...payload
    };
  }

  getDatabaseFilename() {
    return this.options?.filename ?? join(workingDirectory(), '/feed.sqlite');
  }
}
