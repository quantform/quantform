import { workingDirectory, Measurement, Measure } from '@quantform/core';
import { Statement } from 'sqlite3';
import { join } from 'path';
import { SQLiteConnection } from './sqlite-connection';

export class SQLiteMeasurement extends SQLiteConnection implements Measurement {
  private readonly statement: {
    backward: Record<string, Statement>;
    forward: Record<string, Statement>;
    write: Record<string, Statement>;
  } = {
    backward: {},
    forward: {},
    write: {}
  };

  private async tryCreateTable(session: string): Promise<void> {
    await new Promise<void>(async resolve => {
      this.connection.run(
        `
        CREATE TABLE IF NOT EXISTS "${session}" (
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
    session: string,
    timestamp: number,
    direction: 'FORWARD' | 'BACKWARD'
  ): Promise<Measure[]> {
    await this.tryConnect();

    let statement: Statement;

    if (direction == 'BACKWARD' && !this.statement.backward[session]) {
      await this.tryCreateTable(session);

      statement = this.statement.backward[session] = this.connection.prepare(
        `SELECT * FROM "${session}"
           WHERE timestamp < ?
           ORDER BY timestamp DESC
           LIMIT ?`
      );
    }

    if (direction == 'FORWARD' && !this.statement.forward[session]) {
      await this.tryCreateTable(session);

      statement = this.statement.forward[session] = this.connection.prepare(
        `SELECT * FROM "${session}"
           WHERE timestamp > ?
           ORDER BY timestamp
           LIMIT ?`
      );
    }

    const limit = Math.max(0, this.options?.limit ?? 50000);

    return await new Promise<Measure[]>(async resolve => {
      statement.all([timestamp, limit], async (error, rows) => {
        if (error) {
          throw new Error(error.message);
        } else {
          let measure = rows.map(it => this.deserialize(it.timestamp, it.type, it.json));

          if (direction == 'BACKWARD') {
            measure = measure.reverse();
          }

          resolve(measure);
        }
      });
    });
  }

  async write(session: string, measurements: Measure[]): Promise<void> {
    await this.tryConnect();

    if (!this.statement.write[session]) {
      await this.tryCreateTable(session);

      this.statement.write[session] = this.connection.prepare(`
          REPLACE INTO "${session}" (timestamp, type, json)
          VALUES(?, ?, ?); 
        `);
    }

    for (const measure of measurements) {
      const serialized = this.serialize(measure);

      await new Promise<void>(async resolve => {
        this.statement.write[session].run(
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

  private serialize(event: Measure): { timestamp: number; type: string; json: string } {
    return {
      timestamp: event.timestamp,
      type: event.type,
      json: JSON.stringify(event, (key, value) =>
        key != 'timestamp' && key != 'type' ? value : undefined
      )
    };
  }

  private deserialize(timestamp: number, type: string, json: string): Measure {
    const payload = JSON.parse(json);

    payload.timestamp = timestamp;
    payload.type = type;

    return payload;
  }

  getDatabaseFilename() {
    return this.options?.filename ?? join(workingDirectory(), '/measurement.sqlite');
  }
}