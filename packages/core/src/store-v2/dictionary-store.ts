import { Observable } from 'rxjs';

import { Store } from '@lib/store-v2/store';

export class DictionaryStore<T extends { timestamp: number }> {
  private readonly mapping: Record<string, Store<T>> = {};

  constructor(state: Record<string, T>) {
    Object.entries<T>(state).reduce((agg, [key, value]) => {
      this.put(key, value);

      return agg;
    }, {} as Record<string, Store<T>>);
  }

  put(key: string, value: T) {
    this.mapping[key] = new Store<T>(value);
  }

  patch(key: string, func: (state: T) => void): void {
    this.mapping[key]?.patch(func);
  }

  select<V>(key: string, selector: (state: T) => V): Observable<V> {
    return this.mapping[key].select(selector);
  }
}
