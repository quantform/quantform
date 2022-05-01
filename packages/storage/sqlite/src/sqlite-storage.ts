import {
  Storage,
  StorageDocument,
  StorageFactory,
  StorageQueryOptions,
  workingDirectory
} from '@quantform/core';
import { Database } from 'better-sqlite3';
import * as bettersqlite3 from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export class SQLiteStorage implements Storage {
  protected connection: Database;

  constructor(private readonly filename: string) {}

  private tryConnect() {
    if (this.connection) {
      return;
    }

    if (!existsSync(dirname(this.filename))) {
      mkdirSync(dirname(this.filename), { recursive: true });
    }

    this.connection = bettersqlite3(this.filename);
  }

  private tryCreateTable(table: string) {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS "${table}" (
          timestamp INTEGER NOT NULL, 
          kind TEXT NOT NULL, 
          json TEXT NOT NULL, 
          PRIMARY KEY (timestamp, kind)
        )`
    );
  }

  async index(): Promise<Array<string>> {
    this.tryConnect();

    return this.connection
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(it => it.name);
  }

  async query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]> {
    this.tryConnect();

    if (
      !this.connection
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${library}'`
        )
        .all().length
    ) {
      return [];
    }

    const isBackward = options.from == undefined;

    let rows = this.connection
      .prepare(
        `SELECT * FROM "${library}"
           WHERE timestamp > ? AND timestamp < ? ${
             options.kind ? `AND kind = '${options.kind}'` : ''
           }
           ORDER BY timestamp ${isBackward ? 'DESC' : ''}
           LIMIT ?`
      )
      .all(
        [options.from ?? 0, options.to ?? Number.MAX_VALUE],
        Math.min(options.count, 50000)
      );

    if (isBackward) {
      rows = rows.reverse();
    }

    return rows;
  }

  async save(library: string, documents: StorageDocument[]): Promise<void> {
    this.tryConnect();
    this.tryCreateTable(library);

    const statement = this.connection.prepare(`
      REPLACE INTO "${library}" (timestamp, kind, json)
      VALUES(?, ?, ?); 
    `);

    const insertMany = this.connection.transaction(rows =>
      rows.forEach(it => statement.run(it.timestamp, it.kind, it.json))
    );

    insertMany(documents);
  }
}

export class SQLiteStorageFactory implements StorageFactory {
  constructor(private readonly directory?: string) {}

  create(type: string): Storage {
    return new SQLiteStorage(
      join(this.directory ?? workingDirectory(), `/${type}.sqlite`)
    );
  }
}
