import { BehaviorSubject, map, Subject } from 'rxjs';

import { State } from '../store';
import { Asset } from './asset';
import { Component } from './component';
import { Instrument } from './instrument';
import { Order } from './order';
import { order, orders } from './order.operator';

const instrument = new Instrument(
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def'
);

describe('order', () => {
  test('should pipe an order', done => {
    new BehaviorSubject<Component>(Order.market(instrument, -100))
      .pipe(order(instrument))
      .subscribe({
        next: it => {
          expect(it.instrument).toEqual(instrument);
          expect(it.quantity).toEqual(-100);
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

    order1 = Order.market(instrument, -100);
    order2 = Order.limit(instrument, 100, 10);
    order3 = Order.market(instrument, 100);

    state.order[order1.id] = order1;
    state.order[order2.id] = order2;
    state.order[order3.id] = order3;
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
