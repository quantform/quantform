import { Session } from '@quantform/core';
import { z } from 'zod';

import {
  SessionBalanceContract,
  SessionBalanceModel,
  toSessionBalanceModel
} from './SessionBalanceModel';
import {
  SessionOrderContract,
  SessionOrderModel,
  toSessionOrderModel
} from './SessionOrderModel';
import {
  SessionPositionContract,
  SessionPositionModel,
  toSessionPositionModel
} from './SessionPositionModel';

export const SessionContract = z.object({
  timestamp: z.number(),
  balances: z.array(SessionBalanceContract),
  orders: z.array(SessionOrderContract),
  positions: z.array(SessionPositionContract)
});

export type SessionModel = z.infer<typeof SessionContract>;

export function toSessionModel(session: Session, timestamp: number): SessionModel {
  const { balance, order } = session.store.snapshot;

  const balances = balance.asReadonlyArray().reduce((balances, it) => {
    if (it.timestamp > timestamp) {
      balances.push(toSessionBalanceModel(it));
    }

    return balances;
  }, new Array<SessionBalanceModel>());

  const orders = order.asReadonlyArray().reduce(
    (orders, innerOrders) =>
      innerOrders.asReadonlyArray().reduce((orders, it) => {
        if (it.timestamp > timestamp) {
          orders.push(toSessionOrderModel(it));
        }

        return orders;
      }, orders),
    new Array<SessionOrderModel>()
  );

  const positions = balance.asReadonlyArray().reduce(
    (positions, it) =>
      Object.values(it.position).reduce((positions, it) => {
        if (it.timestamp > timestamp) {
          positions.push(toSessionPositionModel(it));
        }

        return positions;
      }, positions),
    new Array<SessionPositionModel>()
  );

  return {
    timestamp,
    balances,
    orders,
    positions
  };
}
