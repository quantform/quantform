import { decimal } from '@lib/shared';

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
export type QueryObjectType<T extends { timestamp: 'number' }> = {
  discriminator: string;
  type: {
    [key in keyof T]: QueryMappingType;
  };
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

export type QueryMappingType = 'number' | 'string' | 'decimal';
export type InferQueryMappingType<T> = T extends QueryObjectType<infer U>
  ? {
      [key in keyof U]: U[key] extends 'number'
        ? number
        : U[key] extends 'string'
        ? string
        : U[key] extends 'decimal'
        ? decimal
        : never;
    }
  : never;

export interface Storage {
  index(): Promise<Array<string>>;
  save<T extends QueryObjectType<K>, K extends { timestamp: 'number' }>(
    type: T,
    objects: InferQueryMappingType<T>[]
  ): Promise<void>;
  query<T extends QueryObjectType<K>, K extends { timestamp: 'number' }>(
    type: T,
    query: Query<InferQueryMappingType<T>>
  ): Promise<InferQueryMappingType<T>[]>;
}

export function storageObject<
  K extends QueryObject,
  T extends { [key in keyof K]: QueryMappingType } & { timestamp: 'number' }
>(discriminator: string, type: T): QueryObjectType<T> {
  return {
    discriminator,
    type
  };
}
