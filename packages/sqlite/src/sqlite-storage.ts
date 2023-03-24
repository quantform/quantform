import { Database } from 'better-sqlite3';
import * as bettersqlite3 from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { NoConnectionError } from '@lib/error';
import {
  provider,
  Query,
  QueryObject,
  QueryObjectType,
  Storage,
  StorageFactory,
  workingDirectory
} from '@quantform/core';

@provider()
export class SQLiteStorageFactory implements StorageFactory {
  constructor(private readonly directory?: string) {}

  for(key: string): Storage {
    return new SQLiteStorage(
      join(this.directory ?? workingDirectory(), `/${key}.sqlite`)
    );
  }
}

export class SQLiteStorage implements Storage {
  protected connection?: Database;

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
    if (!this.connection) {
      throw new NoConnectionError();
    }

    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS "${table}" (
          timestamp INTEGER NOT NULL, 
          json TEXT NOT NULL, 
          PRIMARY KEY (timestamp)
        )`
    );
  }

  async index(): Promise<Array<string>> {
    this.tryConnect();

    if (!this.connection) {
      throw new NoConnectionError();
    }

    return this.connection
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(it => it.name);
  }

  // eslint-disable-next-line complexity
  async query<T extends QueryObject>(
    type: QueryObjectType<T>,
    query: Query<T>
  ): Promise<T[]> {
    this.tryConnect();

    if (!this.connection) {
      throw new NoConnectionError();
    }

    if (
      !this.connection
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${type.tableName}'`
        )
        .all().length
    ) {
      return [];
    }

    let sql = `SELECT * FROM ${type.tableName}`;

    if (query.where?.timestamp) {
      const expression = query.where.timestamp;

      switch (expression?.type) {
        case 'eq':
          sql = `${sql} WHERE timestamp = ${expression.value}`;
          break;
        case 'gt':
          sql = `${sql} WHERE timestamp > ${expression.value}`;
          break;
        case 'lt':
          sql = `${sql} WHERE timestamp < ${expression.value}`;
          break;
        case 'between':
          sql = `${sql} WHERE timestamp > ${expression.min} AND timestamp < ${expression.max}`;
          break;
      }
    }

    if (query.orderBy) {
      sql = `${sql} ORDER BY timestamp ${query.orderBy ?? 'ASC'}`;
    }

    if (query.limit) {
      sql = `${sql} LIMIT ${query.limit}`;
    }

    const serializedObjects = await this.connection.prepare(sql).all();

    return serializedObjects.map(it => JSON.parse(it.json));
  }

  async save<T extends QueryObject>(
    type: QueryObjectType<T>,
    objects: T[]
  ): Promise<void> {
    this.tryConnect();

    if (!this.connection) {
      throw new NoConnectionError();
    }

    this.tryCreateTable(type.tableName);

    const statement = this.connection.prepare(`
      REPLACE INTO "${type.tableName}" (timestamp, json)
      VALUES(?, ?); 
    `);

    const insertMany = this.connection.transaction(rows =>
      rows.forEach((it: T) => statement.run(it.timestamp, JSON.stringify(it)))
    );

    insertMany(objects);
  }
}
