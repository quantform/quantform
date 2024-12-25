import { Dependency, useContext } from '@lib/module';
import { Storage } from '@lib/storage';

const token = Symbol('storage-factory-token');

export interface StorageFactory {
  for(key: string): Storage;
}

export function useStorageFactory() {
  return useContext<StorageFactory>(token);
}

useStorageFactory.options = (factory: StorageFactory): Dependency => ({
  provide: token,
  useValue: factory
});
