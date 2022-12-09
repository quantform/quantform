import { Observable, Subject } from 'rxjs';

import { Component } from '@lib/domain';
import { Context } from '@lib/shared';
import { State, StateChangeTracker, StoreEvent } from '@lib/store';

@Context()
export class Store implements StateChangeTracker {
  private readonly pendingChanges = new Array<Component>();
  private readonly changes = new Subject<Component>();

  readonly snapshot = new State();

  get changes$(): Observable<Component> {
    return this.changes.asObservable();
  }

  dispatch(...events: StoreEvent[]) {
    for (const event of events) {
      event.handle(this.snapshot, this);
    }

    this.commitPendingChanges();
  }

  commit(component: Component) {
    if (this.pendingChanges.some(it => it === component)) {
      return;
    }

    this.pendingChanges.push(component);
  }

  commitPendingChanges() {
    this.pendingChanges.forEach(it => this.changes.next(it));
    this.pendingChanges.splice(0, this.pendingChanges.length);
  }

  dispose() {
    this.changes.complete();
  }
}
