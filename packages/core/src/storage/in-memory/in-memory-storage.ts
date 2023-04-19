import {
  InferQueryObject,
  Query,
  QueryObject,
  QueryObjectType,
  Storage
} from '@lib/storage';

export class InMemoryStorage implements Storage {
  private tables: Record<string, QueryObject[]> = {};

  async index(): Promise<Array<string>> {
    return Object.keys(this.tables);
  }

  async query<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    query: Query<InferQueryObject<T>>
  ): Promise<InferQueryObject<T>[]> {
    if (!this.tables[type.discriminator]) {
      return [];
    }

    let set = this.tables[type.discriminator];

    if (query.where) {
      for (const prop of Object.keys(query.where)) {
        const expression = query.where[prop];

        switch (expression?.type) {
          case 'eq':
            set = set.filter(it => it[prop] === expression.value);
            break;
          case 'gt':
            set = set.filter(it => +it[prop] > expression.value);
            break;
          case 'lt':
            set = set.filter(it => +it[prop] < expression.value);
            break;
          case 'between':
            set = set.filter(
              it => +it[prop] > expression.min && +it[prop] < expression.max
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

    return set as InferQueryObject<T>[];
  }

  async save<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    objects: InferQueryObject<T>[]
  ): Promise<void> {
    if (!this.tables[type.discriminator]) {
      this.tables[type.discriminator] = [];
    }

    const buffer = this.tables[type.discriminator];

    for (const document of objects) {
      buffer.push(document);
    }

    buffer.sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
  }

  clear() {
    this.tables = {};
  }
}
