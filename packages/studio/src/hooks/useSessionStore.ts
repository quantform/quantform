import create from 'zustand';

import { BalanceModel, OrderModel, PositionModel } from '../models';

interface SessionState {
  timestamp: number;
  balances: BalanceModel[];
  orders: OrderModel[];
  positions: PositionModel[];
}

interface SessionStateAction {
  upsertBalance(balance: BalanceModel);
}

export const useSessionStore = create<SessionState & SessionStateAction>(set => ({
  timestamp: 0,
  balances: [],
  orders: [],
  positions: [],
  upsertBalance: (balance: BalanceModel) =>
    set(state => {
      const balances = state.balances.filter(it => it.key != balance.key);

      balances.push(balance);

      return { timestamp: Math.max(balance.timestamp, state.timestamp), balances };
    })
}));
