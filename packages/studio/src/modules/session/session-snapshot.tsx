import { Balance, Component, Measure, Order, Session } from '@quantform/core';
import { filter, map, tap } from 'rxjs';
import { StudySession } from './session';
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

  constructor(private readonly session: StudySession) {
    session.store.changes$
      .pipe(
        map(it => this.reduceComponentChanged(it)),
        filter(it => it != undefined),
        tap(it => (this.changes.components.push = true))
      )
      .subscribe();
    session.measurement$.pipe(tap(it => this.changes.measurements.push(it))).subscribe();
  }

  getSnapshot() {
    const { balance, order } = this.session.store.snapshot;

    const snapshot = {
      balance: {},
      orders: {},
      positions: {}
    } as SessionSnapshotContextState;

    Object.values(balance)
      .map(getBalanceSnapshot)
      .forEach(it => (snapshot.balance[it.key] = it));

    Object.values(order)
      .map(getOrderSnapshot)
      .forEach(it => (snapshot.orders[it.key] = it));

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
      case 'balance':
        const balance = getBalanceSnapshot(component as Balance);
        this.changes.components.balance[balance.key] = balance;
        return balance;
      case 'order':
        const order = getOrderSnapshot(component as Order);
        this.changes.components.orders[order.key] = order;
        return order;
    }
  }
}
