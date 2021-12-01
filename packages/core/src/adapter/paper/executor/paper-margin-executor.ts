import { pnl, weightedMean } from '../../../shared';
import { Order } from '../../../domain';
import {
  BalanceTransactEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent,
  PositionPatchEvent
} from '../../../store/event';
import { PaperAdapter } from '..';
import { PaperExecutor } from './paper-executor';

export class PaperMarginExecutor extends PaperExecutor {
  leverage = 10;

  constructor(adapter: PaperAdapter) {
    super(adapter);
  }

  onOrderOpened(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(new OrderNewEvent(order, timestamp));
    this.adapter.store.dispatch(new OrderPendingEvent(order.id, timestamp));
  }

  onOrderCompleted(order: Order, averageExecutionRate: number, timestamp: number) {
    const instrument =
      this.adapter.store.snapshot.universe.instrument[order.instrument.toString()];

    let transact = instrument.quote.floor(
      -instrument.commission.calculateMakerFee(averageExecutionRate * order.quantity)
    );

    const id = instrument.toString();
    const position =
      this.adapter.store.snapshot.balance[instrument.quote.toString()].position[id];

    let rate = position?.averageExecutionRate ?? 0;
    let size = position?.size ?? 0;
    let quantity = order.quantity;

    switch (order.side) {
      case 'BUY':
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

        break;

      case 'SELL':
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

        break;
    }

    this.adapter.store.dispatch(
      new OrderFilledEvent(order.id, averageExecutionRate, timestamp),
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

    this.adapter.store.dispatch(new OrderCancelingEvent(order.id, timestamp));
    this.adapter.store.dispatch(new OrderCanceledEvent(order.id, timestamp));
  }
}