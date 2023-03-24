import { provider } from '@lib/module';

import {
  Query,
  QueryObject,
  QueryObjectType,
  Storage,
  StorageFactory,
  StorageFactoryToken
} from './storage';

export function inMemoryStorage() {
  return {
    provide: StorageFactoryToken,
    useClass: InMemoryStorageFactory
  };
}

@provider()
export class InMemoryStorageFactory implements StorageFactory {
  private static storage: Record<string, Storage> = {};

  for(key: string): Storage {
    return (
      InMemoryStorageFactory.storage[key] ??
      (InMemoryStorageFactory.storage[key] = new InMemoryStorage())
    );
  }
}

export class InMemoryStorage implements Storage {
  private tables: Record<string, QueryObject[]> = {};

  async index(): Promise<Array<string>> {
    return Object.keys(this.tables);
  }

  async query<T extends QueryObject>(
    type: QueryObjectType<T>,
    query: Query<T>
  ): Promise<T[]> {
    if (!this.tables[type.tableName]) {
      return [];
    }

    let set = this.tables[type.tableName];

    if (query.where) {
      for (const prop of Object.keys(query.where)) {
        const expression = query.where[prop];

        switch (expression?.type) {
          case 'eq':
            set = set.filter(it => it[prop] === expression.value);
            break;
          case 'gt':
            set = set.filter(it => it[prop] > expression.value);
            break;
          case 'lt':
            set = set.filter(it => it[prop] < expression.value);
            break;
          case 'between':
            set = set.filter(
              it => it[prop] > expression.min && it[prop] < expression.max
            );
            break;
        }
      }
    }

    if (query.limit) {
      set = set.slice(0, query.limit);
    }

    if (query.orderBy === 'DESC') {
      set = set.reverse();
    }

    return set as T[];
  }

  async save<T extends QueryObject>(
    type: QueryObjectType<T>,
    objects: T[]
  ): Promise<void> {
    if (!this.tables[type.tableName]) {
      this.tables[type.tableName] = [];
    }

    const buffer = this.tables[type.tableName];

    for (const document of objects) {
      buffer.push(document);
    }

    buffer.sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
  }

  clear() {
    this.tables = {};
  }
}
