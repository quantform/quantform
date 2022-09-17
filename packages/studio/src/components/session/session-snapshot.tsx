import { Balance, Component, Measure, Order, Session } from '@quantform/core';
import { filter, map, tap } from 'rxjs';

import {
  getBalanceSnapshot,
  getOrderSnapshot,
  SessionSnapshotContextState
} from './session-snapshot-models';

export class SessionSnapshot {
  private changes = {
    components: {
      balance: {},
      orders: {},
      positions: {}
    } as SessionSnapshotContextState & { push: boolean },
    measurements: new Array<Measure>()
  };

  constructor(private readonly session: Session) {
    session.store.changes$
      .pipe(
        map(it => this.reduceComponentChanged(it)),
        filter(it => it != undefined),
        tap(it => (this.changes.components.push = true))
      )
      .subscribe();
    //session.measurement$.pipe(tap(it => this.changes.measurements.push(it))).subscribe();
  }

  getSnapshot() {
    const { balance, order } = this.session.store.snapshot;

    const snapshot = {
      balance: {},
      orders: {},
      positions: {}
    } as SessionSnapshotContextState;

    balance
      .asReadonlyArray()
      .filter(it => it.free.greaterThan(0) || it.locked.greaterThan(0))
      .map(getBalanceSnapshot)
      .forEach(it => (snapshot.balance[it.key] = it));

    order.asReadonlyArray().reduce(
      (acc, it) =>
        it.asReadonlyArray().reduce((acc, it) => {
          const snapshot = getOrderSnapshot(it);
          acc[snapshot.key] = snapshot;

          return acc;
        }, acc),
      snapshot.orders
    );

    return snapshot;
  }

  getChanges() {
    if (!this.changes.components.push && this.changes.measurements.length === 0) {
      return undefined;
    }

    const { components, measurements } = this.changes;

    this.changes = {
      components: {
        push: false,
        balance: {},
        orders: {},
        positions: {}
      },
      measurements: []
    };

    return {
      components,
      measurements
    };
  }

  reduceComponentChanged(component: Component) {
    switch (component.kind) {
      case 'balance': {
        const balance = getBalanceSnapshot(component as Balance);
        this.changes.components.balance[balance.key] = balance;
        return balance;
      }
      case 'order': {
        const order = getOrderSnapshot(component as Order);
        this.changes.components.orders[order.key] = order;
        return order;
      }
    }
  }
}
