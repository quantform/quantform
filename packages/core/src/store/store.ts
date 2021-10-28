import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { State } from './store.state';
import { Component } from '../domain';
import { Set } from 'typescript-collections';
import { StoreEvent } from './event/store.event';
import { handler, Topic } from '../common/topic';
import { TradePatchEvent, TradePatchEventHandler } from './event/store-trade.event';
import {
  BalanceFreezEvent,
  BalanceFreezEventHandler,
  BalancePatchEvent,
  BalancePatchEventHandler,
  BalanceTransactEvent,
  BalanceTransactEventHandler,
  BalanceUnfreezEvent,
  BalanceUnfreezEventHandler,
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
  OrderCompletedEvent,
  OrderCompletedEventHandler,
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
  PositionPatchEventHandler
} from './event';

export class Store extends Topic<StoreEvent, any> {
  private readonly changes = new Subject<Component>();
  private readonly state = new BehaviorSubject<State>(new State());

  get state$(): Observable<State> {
    return this.state.asObservable();
  }

  get changes$(): Observable<Component> {
    return this.changes.asObservable();
  }

  get snapshot(): State {
    return this.state.value;
  }

  dispatch(...events: StoreEvent[]) {
    const notifyComponentsChanged = new Set<Component>();

    for (const event of events) {
      const componentOrComponents = super.dispatch(event, {});

      if (Array.isArray(componentOrComponents)) {
        componentOrComponents.forEach(it => notifyComponentsChanged.add(it));
      } else {
        notifyComponentsChanged.add(componentOrComponents);
      }
    }

    notifyComponentsChanged.forEach(it => this.changes.next(it));
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
    return InstrumentPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see InstrumentSubscribedPatchEventHandler
   */
  @handler(InstrumentSubscriptionEvent)
  onInstrumentSubscription(event: InstrumentSubscriptionEvent) {
    return InstrumentSubscriptionEventHandler(event, this.snapshot);
  }

  /**
   * @see BalancePatchEventHandler
   */
  @handler(BalancePatchEvent)
  onBalancePatch(event: BalancePatchEvent) {
    return BalancePatchEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceTransactEventHandler
   */
  @handler(BalanceTransactEvent)
  onBalanceTransact(event: BalanceTransactEvent) {
    return BalanceTransactEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceFreezEventHandler
   */
  @handler(BalanceFreezEvent)
  onBalanceFreez(event: BalanceFreezEvent) {
    return BalanceFreezEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceUnfreezEventHandler
   */
  @handler(BalanceUnfreezEvent)
  onBalanceUnfreez(event: BalanceUnfreezEvent) {
    return BalanceUnfreezEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderLoadEventHandler
   */
  @handler(OrderLoadEvent)
  onOrderLoad(event: OrderLoadEvent) {
    return OrderLoadEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderNewEventHandler
   */
  @handler(OrderNewEvent)
  onOrderNew(event: OrderNewEvent) {
    return OrderNewEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderPendingEventHandler
   */
  @handler(OrderPendingEvent)
  onOrderPending(event: OrderPendingEvent) {
    return OrderPendingEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCompletedEventHandler
   */
  @handler(OrderCompletedEvent)
  onOrderCompleted(event: OrderCompletedEvent) {
    return OrderCompletedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCancelingEventHandler
   */
  @handler(OrderCancelingEvent)
  onOrderCanceling(event: OrderCancelingEvent) {
    return OrderCancelingEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCanceledEventHandler
   */
  @handler(OrderCanceledEvent)
  onOrderCanceled(event: OrderCanceledEvent) {
    return OrderCanceledEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCancelFailedEventHandler
   */
  @handler(OrderCancelFailedEvent)
  onOrderCancelFailed(event: OrderCancelFailedEvent) {
    return OrderCancelFailedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderRejectedEventHandler
   */
  @handler(OrderRejectedEvent)
  onOrderRejected(event: OrderRejectedEvent) {
    return OrderRejectedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderbookPatchEventHandler
   */
  @handler(OrderbookPatchEvent)
  onOrderbookPatch(event: OrderbookPatchEvent) {
    return OrderbookPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see PositionLoadEventHandler
   */
  @handler(PositionLoadEvent)
  onPositionLoad(event: PositionLoadEvent) {
    return PositionLoadEventHandler(event, this.snapshot);
  }

  /**
   * @see PositionPatchEventHandler
   */
  @handler(PositionPatchEvent)
  onPositionPatch(event: PositionPatchEvent) {
    return PositionPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see TradePatchEventHandler
   */
  @handler(TradePatchEvent)
  onTradePatch(event: TradePatchEvent) {
    return TradePatchEventHandler(event, this.snapshot);
  }
}
