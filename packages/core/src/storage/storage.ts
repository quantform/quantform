import { decimal } from '@lib/shared';

export const StorageFactoryToken = Symbol('storage-factory-token');

export interface StorageFactory {
  for(key: string): Storage;
}

type Types = string | number | decimal;

export const eq = <T extends Types>(value: T) => ({ type: 'eq' as const, value });
export const gt = <T extends number>(value: T) => ({ type: 'gt' as const, value });
export const lt = <T extends number>(value: T) => ({ type: 'lt' as const, value });
export const between = <T extends number>(min: T, max: T) => ({
  type: 'between' as const,
  min,
  max
});

export type QueryObject = Record<string, Types> & { timestamp: number };
export type QueryObjectType<T extends QueryObject> = {
  tableName: string;
};

export type QueryWhere =
  | ReturnType<typeof eq>
  | ReturnType<typeof gt>
  | ReturnType<typeof lt>
  | ReturnType<typeof between>;

export type Query<T extends QueryObject> = {
  where?: Partial<{
    [key in keyof T]: QueryWhere;
  }>;
  orderBy?: 'ASC' | 'DESC';
  limit?: number;
};

export interface Storage {
  index(): Promise<Array<string>>;
  save<T extends QueryObject>(type: QueryObjectType<T>, objects: T[]): Promise<void>;
  query<T extends QueryObject>(type: QueryObjectType<T>, query: Query<T>): Promise<T[]>;
}

export function serializableObject<T extends QueryObject>(
  tableName: string
): QueryObjectType<T> {
  return {
    tableName
  };
}
