import { ModuleDefinition, useModule } from '@lib/module';
import { Store } from '@lib/store/store';

export * from '@lib/store/store';
export * from '@lib/store/store-state';
export * from '@lib/store/store-event';
export * from '@lib/store/error';

export function useStore<T extends Store>() {
  return useModule().get<T>(useStore.InjectionToken);
}

useStore.InjectionToken = Symbol('store');

export function store(): ModuleDefinition {
  return {
    dependencies: [
      {
        provide: useStore.InjectionToken,
        useClass: Store
      }
    ]
  };
}
