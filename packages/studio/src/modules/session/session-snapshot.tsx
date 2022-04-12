import { Balance, Component, Measure, Order, Session } from '@quantform/core';
import { map, filter, tap } from 'rxjs';
import { getBalanceSnapshot, getOrderSnapshot } from './services';
import * as _ from './session';

export class SessionSnapshot {
  private pendingChanges = {
    components: new Array<any>(),
    measurements: new Array<Measure>()
  };

  constructor(private readonly session: Session) {
    session.store.changes$
      .pipe(
        map(it => this.mapComponentChanged(it)),
        filter(it => it != undefined),
        tap(it => this.pendingChanges.components.push(it))
      )
      .subscribe();

    session.measurement$
      .pipe(tap(it => this.pendingChanges.measurements.push(it)))
      .subscribe();
  }

  getSnapshot() {
    const { balance, order } = this.session.store.snapshot;

    return {
      balance: Object.values(balance).map(getBalanceSnapshot),
      orders: Object.values(order).map(getOrderSnapshot)
    };
  }

  getChanges() {
    if (
      this.pendingChanges.components.length == 0 &&
      this.pendingChanges.measurements.length == 0
    ) {
      return undefined;
    }

    const { components, measurements } = this.pendingChanges;

    this.pendingChanges = {
      components: [],
      measurements: []
    };

    return {
      components,
      measurements
    };
  }

  mapComponentChanged(component: Component) {
    switch (component.kind) {
      case 'balance':
        return getBalanceSnapshot(component as Balance);
      case 'order':
        return getOrderSnapshot(component as Order);
    }
  }
}
