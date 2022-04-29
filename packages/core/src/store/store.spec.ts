import { Asset, Instrument, Order, order } from '../domain';
import { now } from '../shared';
import {
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
    store.dispatch(new OrderPendingEvent(buyOrder.id, now()));

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
    store.dispatch(new OrderPendingEvent(buyOrder.id, now()));
    store.dispatch(new OrderFilledEvent(buyOrder.id, 44, now()));

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
    store.dispatch(new OrderPendingEvent(buyOrder.id, now()));
    store.dispatch(new OrderCancelingEvent(buyOrder.id, now()));
    store.dispatch(new OrderCanceledEvent(buyOrder.id, now()));

    expect(buyOrder.state).toBe('CANCELED');
    expect(states.length).toBe(0);
  });
});
