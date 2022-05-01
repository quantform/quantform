import { withLatestFrom } from 'rxjs';

import { Asset, balance, Instrument, Order, order } from '../domain';
import { now } from '../shared';
import {
  BalanceTransactEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderLoadEvent,
  OrderNewEvent,
  OrderPendingEvent
} from './event';
import { Store } from './store';

const instrument = new Instrument(
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def'
);

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  test('should load an existing order and not pipe a changes', () => {
    let hasUpdatedOrder = false;

    store.changes$.pipe(order(instrument)).subscribe({
      next: () => {
        hasUpdatedOrder = true;
      }
    });

    store.dispatch(new OrderLoadEvent(Order.market(instrument, 10), now()));

    expect(hasUpdatedOrder).toBe(false);
  });

  test('should create a new order and pipe a changes', () => {
    let hasUpdatedOrder = false;

    store.changes$.pipe(order(instrument)).subscribe({
      next: () => {
        hasUpdatedOrder = true;
      }
    });

    store.dispatch(new OrderNewEvent(Order.market(instrument, 10), now()));

    expect(hasUpdatedOrder).toBe(true);
  });

  test('should transition order state from new to pending', () => {
    const states = ['NEW', 'PENDING'].reverse();

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        expect(it.state).toBe(states.pop());
      }
    });

    const buyOrder = Order.market(instrument, 10);

    store.dispatch(new OrderNewEvent(buyOrder, now()));
    store.dispatch(new OrderPendingEvent(buyOrder.id, instrument, now()));

    expect(buyOrder.state).toBe('PENDING');
    expect(states.length).toBe(0);
  });

  test('should transition order state from new to filled', () => {
    const states = ['NEW', 'PENDING', 'FILLED'].reverse();

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        expect(it.state).toBe(states.pop());
      }
    });

    const buyOrder = Order.market(instrument, 10);

    store.dispatch(new OrderNewEvent(buyOrder, now()));
    store.dispatch(new OrderPendingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderFilledEvent(buyOrder.id, instrument, 44, now()));

    expect(buyOrder.state).toBe('FILLED');
    expect(buyOrder.averageExecutionRate).toBe(44);
    expect(states.length).toBe(0);
  });

  test('should transition order state from new to canceled', () => {
    const states = ['NEW', 'PENDING', 'CANCELING', 'CANCELED'].reverse();

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        expect(it.state).toBe(states.pop());
      }
    });

    const buyOrder = Order.market(instrument, 10);

    store.dispatch(new OrderNewEvent(buyOrder, now()));
    store.dispatch(new OrderPendingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderCancelingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderCanceledEvent(buyOrder.id, instrument, now()));

    expect(buyOrder.state).toBe('CANCELED');
    expect(states.length).toBe(0);
  });

  test('should patch balance with order and pipe changes once', done => {
    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.universe.asset.upsert(instrument.quote);

    store.changes$
      .pipe(
        balance(instrument.quote, store.snapshot),
        withLatestFrom(store.changes$.pipe(order(instrument)))
      )
      .subscribe({
        next: ([balance, order]) => {
          expect(balance.free).toBe(10);
          expect(order.state).toBe('PENDING');

          done();
        }
      });

    const buyOrder = Order.market(instrument, 10);

    store.dispatch(
      new OrderNewEvent(buyOrder, now()),
      new OrderPendingEvent(buyOrder.id, instrument, now()),
      new BalanceTransactEvent(instrument.quote, 10, now())
    );
  });

  test('should pipe balance and order changes', done => {
    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.universe.asset.upsert(instrument.quote);

    let counter = 2;

    store.changes$.pipe(balance(instrument.quote, store.snapshot)).subscribe({
      next: it => {
        counter--;

        expect(it.free).toBe(10);

        if (!counter) {
          done();
        }
      }
    });

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        counter--;

        expect(it.state).toBe('PENDING');

        if (!counter) {
          done();
        }
      }
    });

    const buyOrder = Order.market(instrument, 10);

    store.dispatch(
      new OrderNewEvent(buyOrder, now()),
      new OrderPendingEvent(buyOrder.id, instrument, now()),
      new BalanceTransactEvent(instrument.quote, 10, now())
    );
  });
});
