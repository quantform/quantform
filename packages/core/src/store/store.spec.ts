import { combineLatest } from 'rxjs';

import {
  Asset,
  balance,
  Commission,
  fromContext,
  Instrument,
  Order,
  order
} from '@lib/component';
import { d, now } from '@lib/shared';
import {
  BalanceLoadEvent,
  BalancePatchEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderLoadEvent,
  OrderNewEvent,
  OrderPendingEvent,
  Store
} from '@lib/store';

const instrument = new Instrument(
  0,
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def',
  Commission.Zero
);

describe(Store.name, () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();

    store.snapshot.universe.asset.upsert(instrument.base);
    store.snapshot.universe.asset.upsert(instrument.quote);
    store.snapshot.universe.instrument.upsert(instrument);
  });

  test('should load an existing order and not pipe a changes', () => {
    let hasUpdatedOrder = false;

    store.changes$.pipe(order(instrument)).subscribe({
      next: () => {
        hasUpdatedOrder = true;
      }
    });

    store.dispatch(
      new BalanceLoadEvent(instrument.quote, d(100), d.Zero, now()),
      new OrderLoadEvent(new Order(0, '1', instrument, d(10), 0), now())
    );

    expect(hasUpdatedOrder).toBe(false);
  });

  test('should create a new order and pipe a changes', () => {
    let hasUpdatedOrder = false;

    store.changes$.pipe(order(instrument)).subscribe({
      next: () => {
        hasUpdatedOrder = true;
      }
    });

    store.dispatch(
      new BalanceLoadEvent(instrument.base, d(100), d.Zero, now()),
      new BalanceLoadEvent(instrument.quote, d(100), d.Zero, now()),
      new OrderNewEvent(new Order(0, '1', instrument, d(10), 0), now())
    );

    expect(hasUpdatedOrder).toBe(true);
  });

  test('should transition order state from new to pending', () => {
    const states = ['NEW', 'PENDING'].reverse();

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        expect(it.state).toBe(states.pop());
      }
    });

    const buyOrder = new Order(0, '1', instrument, d(10), 0);

    store.dispatch(new BalanceLoadEvent(instrument.base, d(100), d.Zero, now()));
    store.dispatch(new BalanceLoadEvent(instrument.quote, d(100), d.Zero, now()));
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

    const buyOrder = new Order(0, '1', instrument, d(10), 0);

    store.dispatch(new BalanceLoadEvent(instrument.base, d(100), d.Zero, now()));
    store.dispatch(new BalanceLoadEvent(instrument.quote, d(100), d.Zero, now()));
    store.dispatch(new OrderNewEvent(buyOrder, now()));
    store.dispatch(new OrderPendingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderFilledEvent(buyOrder.id, instrument, d(44), now()));

    expect(buyOrder.state).toBe('FILLED');
    expect(buyOrder.averageExecutionRate).toEqual(d(44));
    expect(states.length).toBe(0);
  });

  test('should transition order state from new to canceled', () => {
    const states = ['NEW', 'PENDING', 'CANCELING', 'CANCELED'].reverse();

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        expect(it.state).toBe(states.pop());
      }
    });

    const buyOrder = new Order(0, '1', instrument, d(10), 0);

    store.dispatch(new BalanceLoadEvent(instrument.base, d(100), d.Zero, now()));
    store.dispatch(new BalanceLoadEvent(instrument.quote, d(100), d.Zero, now()));
    store.dispatch(new OrderNewEvent(buyOrder, now()));
    store.dispatch(new OrderPendingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderCancelingEvent(buyOrder.id, instrument, now()));
    store.dispatch(new OrderCanceledEvent(buyOrder.id, instrument, now()));

    expect(buyOrder.state).toBe('CANCELED');
    expect(states.length).toBe(0);
  });

  test('should patch balance with order and pipe changes once', done => {
    fromContext(store, () =>
      combineLatest([balance(instrument.quote), store.changes$.pipe(order(instrument))])
    ).subscribe({
      next: ([balance, order]) => {
        expect(balance.free).toEqual(d(10));
        expect(order.state).toEqual('PENDING');

        done();
      }
    });

    const buyOrder = new Order(0, '1', instrument, d(10), 0);

    store.dispatch(
      new BalanceLoadEvent(instrument.base, d(10), d.Zero, now()),
      new BalanceLoadEvent(instrument.quote, d(10), d.Zero, now()),
      new OrderNewEvent(buyOrder, now()),
      new OrderPendingEvent(buyOrder.id, instrument, now()),
      new BalancePatchEvent(instrument.quote, d(10), d.Zero, now())
    );
  });

  test('should pipe balance and order changes', done => {
    let counter = 2;

    store.changes$.pipe(balance(instrument.quote, store.snapshot)).subscribe({
      next: it => {
        counter--;

        expect(it.free).toEqual(d(10));

        if (!counter) {
          done();
        }
      }
    });

    store.changes$.pipe(order(instrument)).subscribe({
      next: it => {
        counter--;

        expect(it.state).toEqual('PENDING');

        if (!counter) {
          done();
        }
      }
    });

    const buyOrder = new Order(0, '1', instrument, d(10), 0);

    store.dispatch(
      new BalanceLoadEvent(instrument.base, d(10), d.Zero, now()),
      new BalanceLoadEvent(instrument.quote, d(10), d.Zero, now()),
      new OrderNewEvent(buyOrder, now()),
      new OrderPendingEvent(buyOrder.id, instrument, now()),
      new BalancePatchEvent(instrument.quote, d(10), d.Zero, now())
    );
  });
});
