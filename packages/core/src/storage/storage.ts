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
export type StorageFactory = (type: string) => Storage;

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

export function inMemoryStorageFactory(): StorageFactory {
  const storage: Record<string, Storage> = {};

  return (type: string) => storage[type] ?? (storage[type] = new InMemoryStorage());
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
