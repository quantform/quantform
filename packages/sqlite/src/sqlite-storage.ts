import { Database } from 'better-sqlite3';
import * as bettersqlite3 from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import {
  provider,
  Query,
  QueryObject,
  QueryObjectType,
  StorageFactory,
  type,
  workingDirectory
} from '@quantform/core';

@provider()
export class SQLiteStorageFactory implements StorageFactory {
  constructor(private readonly directory?: string) {}

  for(key: string): type {
    return new SQLiteStorage(
      join(this.directory ?? workingDirectory(), `/${key}.sqlite`)
    );
  }
}

export class SQLiteStorage implements type {
  protected connection: Database;
  private tables?: string[];

  constructor(readonly filename: string) {
    if (!existsSync(dirname(this.filename))) {
      mkdirSync(dirname(this.filename), { recursive: true });
    }

    this.connection = bettersqlite3(this.filename);
  }

  private createTable(tableName: string) {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS "${tableName}" (
          timestamp INTEGER NOT NULL, 
          jsonObject JSON NOT NULL, 
          PRIMARY KEY (timestamp)
        )`
    );

    this.tables = undefined;
  }

  async index(): Promise<QueryTypeMapping<string>> {
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
    if (!this.tables) {
      this.tables = await this.index();
    }

    if (!this.tables.includes(type.discriminator)) {
      return [];
    }

    let sql = `SELECT * FROM ${type.discriminator}`;

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

    if (query.InferQueryTypeMapping) {
      sql = `${sql} LIMIT ${query.InferQueryTypeMapping}`;
    }

    const objects = await this.connection.prepare(sql).all();

    return objects.map(it => JSON.parse(it.jsonObject));
  }

  async save<T extends QueryObject>(
    type: QueryObjectType<T>,
    objects: T[]
  ): Promise<void> {
    if (!this.tables) {
      this.tables = await this.index();
    }

    if (!this.tables.includes(type.discriminator)) {
      this.createTable(type.discriminator);
    }

    const statement = this.connection.prepare(`
      REPLACE INTO "${type.discriminator}" (timestamp, jsonObject)
      VALUES(?, ?); 
    `);

    const insertMany = this.connection.transaction(rows =>
      rows.forEach((it: T) => statement.run(it.timestamp, JSON.stringify(it)))
    );

    insertMany(objects);
  }
}
