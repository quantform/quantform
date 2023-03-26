import { useContext } from '@lib/module';
import { Storage } from '@lib/storage';

const token = Symbol('storage-factory-token');

export interface StorageFactory {
  for(key: string): Storage;
}

export function storage(factory: StorageFactory) {
  return {
    provide: token,
    useValue: factory
  };
}

export const useStorageFactory = () => useContext<StorageFactory>(token);
