import { Feed, InstrumentSelector, workingDirectory, StoreEvent } from '@quantform/core';
import { Statement } from 'better-sqlite3';
import { join } from 'path';
import { SQLiteConnection } from './sqlite-connection';

type InstrumentEvent = StoreEvent & { instrument: InstrumentSelector };

export class SQLiteFeed extends SQLiteConnection implements Feed {
  private readonly statement: {
    read: Record<string, Statement>;
    write: Record<string, Statement>;
  } = {
    read: {},
    write: {}
  };

  private tryCreateTable(instrument: InstrumentSelector) {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS "${instrument.toString()}"  (
          timestamp INTEGER NOT NULL, 
          type TEXT NOT NULL, 
          json TEXT NOT NULL, 
          PRIMARY KEY (timestamp, type)
        )`
    );
  }

  async read(
    instrument: InstrumentSelector,
    from: number,
    to: number
  ): Promise<(InstrumentEvent & any)[]> {
    this.tryConnect();

    if (!this.statement.read[instrument.toString()]) {
      this.tryCreateTable(instrument);

      this.statement.read[instrument.toString()] = this.connection.prepare(
        `SELECT * FROM "${instrument.toString()}"
         WHERE timestamp > ? AND timestamp <= ?
         ORDER BY timestamp
         LIMIT ?`
      );
    }

    const limit = Math.max(0, this.options?.limit ?? 50000);
    const rows = this.statement.read[instrument.toString()].all([from, to, limit]);

    return rows
      .map(it => this.deserialize(instrument, it.timestamp, it.type, it.json))
      .filter(it => it);
  }

  async write(instrument: InstrumentSelector, events: InstrumentEvent[]): Promise<void> {
    this.tryConnect();

    if (!this.statement.write[instrument.toString()]) {
      this.tryCreateTable(instrument);

      this.statement.write[instrument.toString()] = this.connection.prepare(`
        REPLACE INTO "${instrument.toString()}" (timestamp, type, json)
        VALUES(?, ?, ?); 
      `);
    }

    const insert = this.statement.write[instrument.toString()];
    const insertMany = this.connection.transaction(rows => {
      for (const row of rows) insert.run(row.timestamp, row.type, row.json);
    });

    insertMany(events.map(it => this.serialize(it)).filter(it => it));
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
