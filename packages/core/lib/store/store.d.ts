import { Observable } from 'rxjs';
import { Component } from '../domain';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';
export declare class Store implements StateChangeTracker {
    private readonly pendingChanges;
    private readonly changes;
    readonly snapshot: State;
    get changes$(): Observable<Component>;
    dispatch(...events: StoreEvent[]): void;
    commit(component: Component): void;
    commitPendingChanges(): void;
    dispose(): void;
}
//# sourceMappingURL=store.d.ts.map