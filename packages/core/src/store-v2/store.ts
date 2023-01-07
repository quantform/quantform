import { BehaviorSubject, map, Observable } from 'rxjs';

export class StoreTransaction {}

export class Store<T extends { timestamp: number }> {
  private readonly state$: BehaviorSubject<T>;

  get snapshot(): T {
    return this.state$.getValue();
  }

  constructor(state: T) {
    this.state$ = new BehaviorSubject(state);
  }

  patch(func: (state: T) => void): void {
    const { timestamp } = this.snapshot;

    func(this.snapshot);

    if (timestamp != this.snapshot.timestamp) {
      this.state$.next(this.snapshot);
    }
  }

  select<V>(selector: (state: T) => V): Observable<V> {
    return this.state$.pipe(map(selector));
  }
}
