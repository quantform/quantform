import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { State } from './store.state';
import { AssetSelector, Component, InstrumentSelector } from '../domain';
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

export class Store extends Topic<StoreEvent, {}> {
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

  subscribe(selector: InstrumentSelector | AssetSelector) {
    const state = this.state.value;

    if (selector instanceof InstrumentSelector) {
      state.subscription.instrument[selector.toString()] = selector;
      state.subscription.asset[selector.base.toString()] = selector.base;
      state.subscription.asset[selector.quote.toString()] = selector.quote;

      this.state.next(state);
    }

    if (selector instanceof AssetSelector) {
      state.subscription.asset[selector.toString()] = selector;

      this.state.next(state);
    }
  }

  /**
   * @see BalancePatchEventHandler
   */
  @handler(BalancePatchEvent)
  onBalancePatchEvent(event: BalancePatchEvent) {
    return BalancePatchEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceTransactEventHandler
   */
  @handler(BalanceTransactEvent)
  onBalanceTransactEvent(event: BalanceTransactEvent) {
    return BalanceTransactEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceFreezEventHandler
   */
  @handler(BalanceFreezEvent)
  onBalanceFreezEvent(event: BalanceFreezEvent) {
    return BalanceFreezEventHandler(event, this.snapshot);
  }

  /**
   * @see BalanceUnfreezEventHandler
   */
  @handler(BalanceUnfreezEvent)
  onBalanceUnfreezEvent(event: BalanceUnfreezEvent) {
    return BalanceUnfreezEventHandler(event, this.snapshot);
  }

  /**
   * @see InstrumentPatchEventHandler
   */
  @handler(InstrumentPatchEvent)
  onInstrumentPatchEvent(event: InstrumentPatchEvent) {
    return InstrumentPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderLoadEventHandler
   */
  @handler(OrderLoadEvent)
  onOrderLoadEvent(event: OrderLoadEvent) {
    return OrderLoadEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderNewEventHandler
   */
  @handler(OrderNewEvent)
  onOrderNewEvent(event: OrderNewEvent) {
    return OrderNewEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderPendingEventHandler
   */
  @handler(OrderPendingEvent)
  onOrderPendingEvent(event: OrderPendingEvent) {
    return OrderPendingEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCompletedEventHandler
   */
  @handler(OrderCompletedEvent)
  onOrderCompletedEvent(event: OrderCompletedEvent) {
    return OrderCompletedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCancelingEventHandler
   */
  @handler(OrderCancelingEvent)
  onOrderCancelingEvent(event: OrderCancelingEvent) {
    return OrderCancelingEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCanceledEventHandler
   */
  @handler(OrderCanceledEvent)
  onOrderCanceledEvent(event: OrderCanceledEvent) {
    return OrderCanceledEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderCancelFailedEventHandler
   */
  @handler(OrderCancelFailedEvent)
  onOrderCancelFailedEvent(event: OrderCancelFailedEvent) {
    return OrderCancelFailedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderRejectedEventHandler
   */
  @handler(OrderRejectedEvent)
  onOrderRejectedEvent(event: OrderRejectedEvent) {
    return OrderRejectedEventHandler(event, this.snapshot);
  }

  /**
   * @see OrderbookPatchEventHandler
   */
  @handler(OrderbookPatchEvent)
  onOrderbookPatchEvent(event: OrderbookPatchEvent) {
    return OrderbookPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see PositionLoadEventHandler
   */
  @handler(PositionLoadEvent)
  onPositionLoadEvent(event: PositionLoadEvent) {
    return PositionLoadEventHandler(event, this.snapshot);
  }

  /**
   * @see PositionPatchEventHandler
   */
  @handler(PositionPatchEvent)
  onPositionPatchEvent(event: PositionPatchEvent) {
    return PositionPatchEventHandler(event, this.snapshot);
  }

  /**
   * @see TradePatchEventHandler
   */
  @handler(TradePatchEvent)
  onTradePatchEvent(event: TradePatchEvent) {
    return TradePatchEventHandler(event, this.snapshot);
  }
}
