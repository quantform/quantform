export type StorageDocument = {
  timestamp: number;
  kind: string;
  json: string;
};

export type StorageQueryOptions = {
  from?: number;
  to?: number;
  kind?: string;
  count: number;
};

/**
 *
 */
export interface Storage {
  /**
   *
   */
  index(): Promise<Array<string>>;

  /**
   *
   * @param library
   * @param documents
   */
  save(library: string, documents: StorageDocument[]): Promise<void>;

  /**
   *
   * @param library
   * @param options
   */
  query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]>;
}

/**
 *
 */
export interface StorageFactory {
  create(type: string): Storage;
}

/**
 *
 */
export class InMemoryStorage implements Storage {
  private tables: Record<string, StorageDocument[]> = {};

  /**
   *
   * @returns
   */
  async index(): Promise<Array<string>> {
    return Object.keys(this.tables);
  }

  /**
   *
   * @param library
   * @param options
   * @returns
   */
  async query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]> {
    if (!this.tables[library]) {
      return [];
    }

    let query = this.tables[library];

    if (options.from) {
      query = query.filter(it => it.timestamp > options.from);
    }

    if (options.to) {
      query = query.filter(it => it.timestamp < options.to);
    }

    if (options.kind) {
      query = query.filter(it => it.kind == options.kind);
    }

    if (options.from == undefined && options.to) {
      query = query.reverse();
    }

    if (options.count) {
      query = query.slice(0, options.count);
    }

    return query;
  }

  /**
   *
   * @param library
   * @param documents
   */
  async save(library: string, documents: StorageDocument[]): Promise<void> {
    if (!this.tables[library]) {
      this.tables[library] = [];
    }

    const buffer = this.tables[library];

    for (const document of documents) {
      buffer.push(document);
    }

    buffer.sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
  }

  /**
   *
   */
  clear() {
    this.tables = {};
  }
}

export class InMemoryStorageFactory implements StorageFactory {
  private readonly storage: Record<string, Storage> = {};

  create(type: string): Storage {
    return this.storage[type] ?? (this.storage[type] = new InMemoryStorage());
  }
}
