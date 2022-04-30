import { Order } from '../../../domain';
import { pnl, weightedMean } from '../../../shared';
import {
  BalanceTransactEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent,
  PositionPatchEvent
} from '../../../store';
import { PaperAdapter } from '..';
import { PaperSimulator } from './paper-simulator';

export class PaperMarginSimulator extends PaperSimulator {
  leverage = 10;

  constructor(adapter: PaperAdapter) {
    super(adapter);
  }

  onOrderOpened(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(new OrderNewEvent(order, timestamp));
    this.adapter.store.dispatch(
      new OrderPendingEvent(order.id, order.instrument, timestamp)
    );
  }

  onOrderCompleted(order: Order, averageExecutionRate: number, timestamp: number) {
    const instrument = this.adapter.store.snapshot.universe.instrument.get(
      order.instrument.id
    );

    let transact = instrument.quote.floor(
      -instrument.commission.calculateMakerFee(averageExecutionRate * order.quantity)
    );

    const id = instrument.id;
    const position = this.adapter.store.snapshot.balance.get(instrument.quote.id)
      .position[id];

    let rate = position?.averageExecutionRate ?? 0;
    let size = position?.size ?? 0;
    let quantity = order.quantity;

    if (order.quantity > 0) {
      if (size < 0) {
        const comsumeQuantity = Math.min(Math.abs(size), quantity);

        transact += pnl(averageExecutionRate, rate, comsumeQuantity);

        size += comsumeQuantity;
        quantity -= comsumeQuantity;
      }

      if (!size) {
        rate = averageExecutionRate;
        size = quantity;
      } else {
        rate = weightedMean([rate, averageExecutionRate], [size, quantity]);
        size += quantity;
      }
    } else if (order.quantity < 0) {
      if (size > 0) {
        const comsumeQuantity = Math.min(size, quantity);

        transact += pnl(rate, averageExecutionRate, comsumeQuantity);

        size -= comsumeQuantity;
        quantity -= comsumeQuantity;
      }

      if (!size) {
        rate = averageExecutionRate;
        size = -quantity;
      } else {
        rate = weightedMean([rate, averageExecutionRate], [size, -quantity]);
        size -= quantity;
      }
    }

    this.adapter.store.dispatch(
      new OrderFilledEvent(order.id, order.instrument, averageExecutionRate, timestamp),
      new BalanceTransactEvent(instrument.quote, transact, timestamp),
      new PositionPatchEvent(
        id,
        instrument,
        rate,
        size,
        this.leverage,
        'CROSS',
        timestamp
      )
    );
  }

  onOrderCanceled(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(
      new OrderCancelingEvent(order.id, order.instrument, timestamp)
    );
    this.adapter.store.dispatch(
      new OrderCanceledEvent(order.id, order.instrument, timestamp)
    );
  }
}
