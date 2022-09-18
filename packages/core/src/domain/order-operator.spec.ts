import { BehaviorSubject, map, Subject } from 'rxjs';

import { d } from '../shared';
import { InnerSet, State } from '../store';
import { Asset } from './asset';
import { Commission } from './commission';
import { Component } from './component';
import { Instrument } from './instrument';
import { Order } from './order';
import { order, orders } from './order-operator';

const instrument = new Instrument(
  0,
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def',
  Commission.Zero
);

describe('order', () => {
  test('should pipe an order', done => {
    new BehaviorSubject<Component>(new Order(0, '1', instrument, d(-100), 0))
      .pipe(order(instrument))
      .subscribe({
        next: it => {
          expect(it.instrument).toEqual(instrument);
          expect(it.quantity).toEqual(d(-100));
          done();
        }
      });
  });

  test('should skip a pipe', done => {
    new BehaviorSubject<Component>(instrument).pipe(order(instrument)).subscribe({
      next: () => fail(),
      complete: done()
    });
  });
});

describe('positions', () => {
  let state: State;
  let order1: Order, order2: Order, order3: Order;

  beforeEach(() => {
    state = new State();

    order1 = new Order(0, '1', instrument, d(-100), 0);
    order2 = new Order(0, '2', instrument, d(100), 0, d(10));
    order3 = new Order(0, '3', instrument, d(100), 0);

    state.order.upsert(new InnerSet<Order>(instrument.id, [order1, order2, order3]));
  });

  test('should pipe all orders on subscription start', done => {
    order1.state = 'NEW';
    order2.state = 'NEW';
    order3.state = 'NEW';

    new Subject<Component>().pipe(orders(instrument, state)).subscribe({
      next: it => {
        expect(it.length).toEqual(3);
        done();
      }
    });
  });

  test('should pipe pending orders on subscription start', done => {
    order1.state = 'NEW';
    order2.state = 'PENDING';
    order3.state = 'PENDING';

    new Subject<Component>()
      .pipe(
        orders(instrument, state),
        map(it => it.filter(order => order.state === 'PENDING'))
      )
      .subscribe({
        next: it => {
          expect(it.length).toEqual(2);
          done();
        }
      });
  });
});
