import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Set } from 'typescript-collections';

import { Component } from '../domain';
import { handler, Topic } from '../shared/topic';
import {
  BalanceFreezEvent,
  BalanceFreezEventHandler,
  BalancePatchEvent,
  BalancePatchEventHandler,
  BalanceTransactEvent,
  BalanceTransactEventHandler,
  BalanceUnfreezEvent,
  BalanceUnfreezEventHandler,
  CandleEvent,
  CandleEventHandler,
  InstrumentPatchEvent,
  InstrumentPatchEventHandler,
  InstrumentSubscriptionEvent,
  InstrumentSubscriptionEventHandler,
  OrderbookPatchEvent,
  OrderbookPatchEventHandler,
  OrderCanceledEvent,
  OrderCanceledEventHandler,
  OrderCancelFailedEvent,
  OrderCancelFailedEventHandler,
  OrderCancelingEvent,
  OrderCancelingEventHandler,
  OrderFilledEvent,
  OrderFilledEventHandler,
  OrderLoadEvent,
  OrderLoadEventHandler,
  OrderNewEvent,
  OrderNewEventHandler,
  OrderPendingEvent,
  OrderPendingEventHandler,
  OrderRejectedEvent,
  OrderRejectedEventHandler,
  PositionLoadEvent,
  PositionLoadEventHandler,
  PositionPatchEvent,
  PositionPatchEventHandler,
  StoreEvent,
  TradePatchEvent,
  TradePatchEventHandler
} from './event';
import { State, StateChangeTracker } from './store.state';

export class Store extends Topic<StoreEvent, any> implements StateChangeTracker {
  private readonly pendingChanges = new Set<Component>();
  private readonly changes = new Subject<Component>();
  private readonly state = new BehaviorSubject<State>(new State());

  get changes$(): Observable<Component> {
    return this.changes.asObservable();
  }

  get snapshot(): State {
    return this.state.value;
  }

  dispatch(...events: StoreEvent[]) {
    for (const event of events) {
      super.dispatch(event, {});
    }

    this.commitPendingChanges();
  }

  commit(component: Component) {
    this.pendingChanges.add(component);
  }

  commitPendingChanges() {
    this.pendingChanges.forEach(it => this.changes.next(it));
    this.pendingChanges.clear();
  }

  dispose() {
    this.state.complete();
    this.changes.complete();
  }

  /**
   * @see InstrumentPatchEventHandler
   */
  @handler(InstrumentPatchEvent)
  onInstrumentPatch(event: InstrumentPatchEvent) {
    return InstrumentPatchEventHandler(event, this.snapshot, this);
  }

  /**
   * @see InstrumentSubscribedPatchEventHandler
   */
  @handler(InstrumentSubscriptionEvent)
  onInstrumentSubscription(event: InstrumentSubscriptionEvent) {
    return InstrumentSubscriptionEventHandler(event, this.snapshot, this);
  }

  /**
   * @see BalancePatchEventHandler
   */
  @handler(BalancePatchEvent)
  onBalancePatch(event: BalancePatchEvent) {
    return BalancePatchEventHandler(event, this.snapshot, this);
  }

  /**
   * @see BalanceTransactEventHandler
   */
  @handler(BalanceTransactEvent)
  onBalanceTransact(event: BalanceTransactEvent) {
    return BalanceTransactEventHandler(event, this.snapshot, this);
  }

  /**
   * @see BalanceFreezEventHandler
   */
  @handler(BalanceFreezEvent)
  onBalanceFreez(event: BalanceFreezEvent) {
    return BalanceFreezEventHandler(event, this.snapshot, this);
  }

  /**
   * @see BalanceUnfreezEventHandler
   */
  @handler(BalanceUnfreezEvent)
  onBalanceUnfreez(event: BalanceUnfreezEvent) {
    return BalanceUnfreezEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderLoadEventHandler
   */
  @handler(OrderLoadEvent)
  onOrderLoad(event: OrderLoadEvent) {
    return OrderLoadEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderNewEventHandler
   */
  @handler(OrderNewEvent)
  onOrderNew(event: OrderNewEvent) {
    return OrderNewEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderPendingEventHandler
   */
  @handler(OrderPendingEvent)
  onOrderPending(event: OrderPendingEvent) {
    return OrderPendingEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderFilledEventHandler
   */
  @handler(OrderFilledEvent)
  onOrderFilled(event: OrderFilledEvent) {
    return OrderFilledEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderCancelingEventHandler
   */
  @handler(OrderCancelingEvent)
  onOrderCanceling(event: OrderCancelingEvent) {
    return OrderCancelingEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderCanceledEventHandler
   */
  @handler(OrderCanceledEvent)
  onOrderCanceled(event: OrderCanceledEvent) {
    return OrderCanceledEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderCancelFailedEventHandler
   */
  @handler(OrderCancelFailedEvent)
  onOrderCancelFailed(event: OrderCancelFailedEvent) {
    return OrderCancelFailedEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderRejectedEventHandler
   */
  @handler(OrderRejectedEvent)
  onOrderRejected(event: OrderRejectedEvent) {
    return OrderRejectedEventHandler(event, this.snapshot, this);
  }

  /**
   * @see OrderbookPatchEventHandler
   */
  @handler(OrderbookPatchEvent)
  onOrderbookPatch(event: OrderbookPatchEvent) {
    return OrderbookPatchEventHandler(event, this.snapshot, this);
  }

  /**
   * @see PositionLoadEventHandler
   */
  @handler(PositionLoadEvent)
  onPositionLoad(event: PositionLoadEvent) {
    return PositionLoadEventHandler(event, this.snapshot, this);
  }

  /**
   * @see PositionPatchEventHandler
   */
  @handler(PositionPatchEvent)
  onPositionPatch(event: PositionPatchEvent) {
    return PositionPatchEventHandler(event, this.snapshot, this);
  }

  /**
   * @see TradePatchEventHandler
   */
  @handler(TradePatchEvent)
  onTradePatch(event: TradePatchEvent) {
    return TradePatchEventHandler(event, this.snapshot, this);
  }

  /**
   * @see CandleEventHandler
   */
  @handler(CandleEvent)
  onCandle(event: CandleEvent) {
    return CandleEventHandler(event, this.snapshot, this);
  }
}
