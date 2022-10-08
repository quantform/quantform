import { Session } from '@quantform/core';

import { BalanceModel, toBalanceModel } from './BalanceModel';
import { OrderModel } from './OrderModel';
import { PositionModel } from './PositionModel';

export type SessionModel = {
  balances: BalanceModel[];
  orders: OrderModel[];
  positions: PositionModel[];
};

export function toSessionModel(session: Session, timestamp: number): SessionModel {
  const { balance, order } = session.store.snapshot;

  return {
    balances: balance
      .asReadonlyArray()
      .filter(it => it.timestamp > timestamp)
      .map(toBalanceModel),
    orders: [],
    positions: []
  };
}
