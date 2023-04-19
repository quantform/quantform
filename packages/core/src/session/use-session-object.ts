import { from } from 'rxjs';

import {
  InferQueryObject,
  Query,
  QueryMappingType,
  QueryObject,
  Storage
} from '@lib/storage';

import { useSessionStorage } from './use-session-storage';

export const useSessionObject = <
  K extends QueryObject,
  T extends { [key in keyof K]: QueryMappingType }
>(
  object: ReturnType<typeof Storage.createObject<K, T>>
) => {
  const storage = useSessionStorage();

  return {
    query: (query: Query<InferQueryObject<typeof object>>) =>
      from(storage.query(object, query)),
    save: (objects: InferQueryObject<typeof object>[]) => storage.save(object, objects)
  };
};
