import { timestamp, workingDirectory, Measurement, Measure } from '@quantform/core';
import { Statement } from 'better-sqlite3';
import { join } from 'path';
import { SQLiteConnection } from './sqlite-connection';

export class SQLiteMeasurement extends SQLiteConnection implements Measurement {
  private readonly statement: {
    backward: Record<number, Statement>;
    forward: Record<number, Statement>;
    write: Record<number, Statement>;
  } = {
    backward: {},
    forward: {},
    write: {}
  };

  private tryCreateTable(session: number) {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS "${session}" (
          timestamp INTEGER NOT NULL, 
          type TEXT NOT NULL, 
          json TEXT NOT NULL, 
          PRIMARY KEY (timestamp, type)
        )`
    );
  }

  async index(): Promise<Array<number>> {
    this.tryConnect();

    return this.connection
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(it => Number(it.name));
  }

  async query(
    session: number,
    options: {
      timestamp: timestamp;
      type?: string;
      limit: number;
      direction: 'FORWARD' | 'BACKWARD';
    }
  ): Promise<Measure[]> {
    this.tryConnect();

    let statement: Statement;

    if (options.direction == 'BACKWARD') {
      if (options.type) {
        statement = this.connection.prepare(
          `SELECT * FROM "${session}"
           WHERE timestamp < ? AND type = '${options.type}'
           ORDER BY timestamp DESC
           LIMIT ?`
        );
      } else {
        statement = this.statement.backward[session];

        if (!statement) {
          this.tryCreateTable(session);

          statement = this.statement.backward[session] = this.connection.prepare(
            `SELECT * FROM "${session}"
           WHERE timestamp < ?
           ORDER BY timestamp DESC
           LIMIT ?`
          );
        }
      }
    }

    if (options.direction == 'FORWARD') {
      if (options.type) {
        statement = this.connection.prepare(
          `SELECT * FROM "${session}"
           WHERE timestamp > ? AND type = '${options.type}'
           ORDER BY timestamp
           LIMIT ?`
        );
      } else {
        statement = this.statement.forward[session];

        if (!statement) {
          this.tryCreateTable(session);

          statement = this.statement.forward[session] = this.connection.prepare(
            `SELECT * FROM "${session}"
           WHERE timestamp > ?
           ORDER BY timestamp
           LIMIT ?`
          );
        }
      }
    }

    const rows = statement.all([options.timestamp, options.limit]);
    let measure = rows.map(it => this.deserialize(it.id, it.timestamp, it.type, it.json));

    if (options.direction == 'BACKWARD') {
      measure = measure.reverse();
    }

    return measure;
  }

  async save(session: number, measurements: Measure[]): Promise<void> {
    this.tryConnect();

    if (!this.statement.write[session]) {
      this.tryCreateTable(session);

      this.statement.write[session] = this.connection.prepare(`
          REPLACE INTO "${session}" (timestamp, type, json)
          VALUES(?, ?, ?); 
        `);
    }

    const insert = this.statement.write[session];
    const insertMany = this.connection.transaction(rows => {
      for (const row of rows) insert.run(row.timestamp, row.type, row.json);
    });

    insertMany(measurements.map(it => this.serialize(it)));
  }

  private serialize(event: Measure): { timestamp: number; type: string; json: string } {
    return {
      timestamp: event.timestamp,
      type: event.type,
      json: JSON.stringify(event, (key, value) =>
        key != 'timestamp' && key != 'type' ? value : undefined
      )
    };
  }

  private deserialize(
    id: string,
    timestamp: number,
    type: string,
    json: string
  ): Measure {
    const payload = JSON.parse(json);

    payload.id = id;
    payload.timestamp = timestamp;
    payload.type = type;

    return payload;
  }

  getDatabaseFilename() {
    return this.options?.filename ?? join(workingDirectory(), '/measurement.sqlite');
  }
}
