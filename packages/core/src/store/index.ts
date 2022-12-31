import { ModuleDefinition } from '@lib/module';
import { useProvider } from '@lib/shared';
import { Store } from '@lib/store/store';

export * from '@lib/store/store';
export * from '@lib/store/store-state';
export * from '@lib/store/store-event';
export * from '@lib/store/error';

export function useStore<T extends Store>() {
  return useProvider<T>(useStore.InjectionToken);
}

useStore.InjectionToken = Symbol('store');

export const store: ModuleDefinition = {
  providers: [
    {
      provide: useStore.InjectionToken,
      useClass: Store
    }
  ]
};
