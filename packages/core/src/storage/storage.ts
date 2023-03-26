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
export type QueryObjectType<T extends QueryObject> = {
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
export type InferQueryObject<T> = T extends QueryObjectType<infer U>
  ? {
      [key in keyof T['type']]: T['type'][key] extends 'number'
        ? number
        : T['type'][key] extends 'string'
        ? string
        : T['type'][key] extends 'decimal'
        ? decimal
        : never;
    } & { timestamp: number }
  : never;

export interface Storage {
  index(): Promise<Array<string>>;
  save<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    objects: InferQueryObject<T>[]
  ): Promise<void>;
  query<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    query: Query<InferQueryObject<T>>
  ): Promise<InferQueryObject<T>[]>;
}

export function storageObject<
  K extends QueryObject,
  T extends { [key in keyof K]: QueryMappingType }
>(discriminator: string, type: T) {
  return {
    discriminator,
    type
  };
}
