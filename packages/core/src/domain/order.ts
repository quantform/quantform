import { Component } from './component';
import { v4 } from 'uuid';
import { InstrumentSelector } from './instrument';
import { timestamp } from '../common';

export type OrderSide = 'SELL' | 'BUY';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP-MARKET' | 'STOP-LIMIT';
export type OrderState =
  | 'NEW'
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELING'
  | 'CANCELED'
  | 'REJECTED';

export class Order implements Component {
  timestamp: timestamp;
  id = v4();
  externalId: string;
  state: OrderState = 'NEW';

  quantityExecuted: number;
  averageExecutionRate: number;
  createdAt: timestamp;
  comment: string;

  static sellMarket(instrument: InstrumentSelector, quantity: number): Order {
    return new Order(instrument, 'SELL', 'MARKET', quantity);
  }

  static buyMarket(instrument: InstrumentSelector, quantity: number): Order {
    return new Order(instrument, 'BUY', 'MARKET', quantity);
  }

  static sellLimit(
    instrument: InstrumentSelector,
    quantity: number,
    rate: number
  ): Order {
    return new Order(instrument, 'SELL', 'LIMIT', quantity, rate);
  }

  static buyLimit(instrument: InstrumentSelector, quantity: number, rate: number): Order {
    return new Order(instrument, 'BUY', 'LIMIT', quantity, rate);
  }

  static sellStopMarket(
    instrument: InstrumentSelector,
    quantity: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'SELL', 'STOP-MARKET', quantity, null, stopRate);
  }

  static buyStopMarket(
    instrument: InstrumentSelector,
    quantity: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'BUY', 'STOP-MARKET', quantity, null, stopRate);
  }

  static sellStopLimit(
    instrument: InstrumentSelector,
    quantity: number,
    rate: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'SELL', 'STOP-LIMIT', quantity, rate, stopRate);
  }

  static buyStopLimit(
    instrument: InstrumentSelector,
    quantity: number,
    rate: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'BUY', 'STOP-LIMIT', quantity, rate, stopRate);
  }

  constructor(
    readonly instrument: InstrumentSelector,
    readonly side: OrderSide,
    readonly type: OrderType,
    readonly quantity: number,
    readonly rate: number = null,
    readonly stopRate: number = null
  ) {
    if (quantity <= 0 || Number.isNaN(quantity)) {
      throw new Error(`invalid order quantity: ${quantity}`);
    }

    if (rate && (Number.isNaN(quantity) || rate <= 0)) {
      throw new Error('invalid order rate');
    }
  }

  measure(): Component {
    const measurement = {
      timestamp: this.timestamp,
      fields: {
        ['side']: this.side,
        ['type']: this.type,
        ['quantity']: this.quantity,
        ['state']: this.state
      },
      tags: {
        ['class']: 'order',
        ['id']: this.id,
        ['instrument']: this.instrument.toString()
      }
    };

    if (this.rate) {
      measurement.fields['rate'] = this.rate;
    }

    if (this.stopRate) {
      measurement.fields['stopRate'] = this.stopRate;
    }

    if (this.averageExecutionRate) {
      measurement.fields['averageExecutionRate'] = this.averageExecutionRate;
    }

    if (this.comment) {
      measurement.fields['comment'] = this.comment;
    }

    return measurement;
  }

  toString() {
    return this.id;
  }
}
