import { from } from 'rxjs';

import {
  InferQueryObject,
  Query,
  QueryMappingType,
  QueryObject,
  storageObject
} from './storage';
import { useSessionStorage } from './use-session-storage';

export const useSessionObject = <
  K extends QueryObject,
  T extends { [key in keyof K]: QueryMappingType }
>(
  discriminator: string,
  type: T
) => {
  const storage = useSessionStorage();
  const object = storageObject<K, T>(discriminator, type);

  return {
    query: (query: Query<InferQueryObject<typeof object>>) =>
      from(storage.query(object, query)),
    save: (objects: InferQueryObject<typeof object>[]) => storage.save(object, objects)
  };
};
