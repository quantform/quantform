import create from 'zustand';

import { SessionBalanceModel, SessionOrderModel, SessionPositionModel } from '../models';
import { SessionModel } from '../models/SessionModel';

interface SessionState {
  timestamp: number;
  balances: SessionBalanceModel[];
  orders: SessionOrderModel[];
  positions: SessionPositionModel[];
}

interface SessionStateAction {
  upsert(update: SessionModel): void;
}

export const useSessionStore = create<SessionState & SessionStateAction>(set => ({
  timestamp: 0,
  balances: [],
  orders: [],
  positions: [],
  upsert: (update: SessionModel) =>
    set(state => {
      const timestamp = Math.max(state.timestamp, update.timestamp);

      const balances = update.balances.reduce(
        (balances, balance) => [...balances.filter(it => it.key != balance.key), balance],
        state.balances
      );

      const orders = update.orders.reduce(
        (orders, order) => [...orders.filter(it => it.key != order.key), order],
        state.orders
      );

      const positions = update.positions.reduce(
        (positions, position) => [
          ...positions.filter(it => it.key != position.key),
          position
        ],
        state.positions
      );

      return { timestamp, balances, orders, positions };
    })
}));
