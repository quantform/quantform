import { Database } from 'better-sqlite3';
import * as bettersqlite3 from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import {
  d,
  InferQueryObject,
  provider,
  Query,
  QueryObject,
  QueryObjectType,
  Storage,
  StorageFactory,
  workingDirectory
} from '@quantform/core';

import { SQLiteLanguage } from './sqlite-language';

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
  protected connection: Database;
  private tables?: string[];

  constructor(readonly filename: string) {
    if (!existsSync(dirname(this.filename))) {
      mkdirSync(dirname(this.filename), { recursive: true });
    }

    this.connection = bettersqlite3(this.filename);
  }

  async index(): Promise<Array<string>> {
    return this.connection
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(it => it.name);
  }

  // eslint-disable-next-line complexity
  async query<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    query: Query<InferQueryObject<T>>
  ): Promise<InferQueryObject<T>[]> {
    if (!this.tables) {
      this.tables = await this.index();
    }

    if (!this.tables.includes(type.discriminator)) {
      return [];
    }

    const objects = await this.connection
      .prepare(SQLiteLanguage.query(type, query))
      .all();

    const types = Object.keys(type.type);

    objects.forEach(it => {
      for (const prop of types) {
        if (type.type[prop] == 'decimal') {
          it[prop] = d(it[prop]);
        }
      }
    });

    return objects;
  }

  async save<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    objects: InferQueryObject<T>[]
  ): Promise<void> {
    if (!this.tables) {
      this.tables = await this.index();
    }

    if (!this.tables.includes(type.discriminator)) {
      this.connection.exec(SQLiteLanguage.createTable(type));

      this.tables = undefined;
    }

    const statement = this.connection.prepare(SQLiteLanguage.replace(type));

    const types = Object.keys(type.type);

    const mapper = (it: InferQueryObject<T>) => types.map(type => it[type].toString());

    const insertMany = this.connection.transaction(rows =>
      rows.forEach((it: InferQueryObject<T>) => statement.run(mapper(it)))
    );

    insertMany(objects);
  }
}
