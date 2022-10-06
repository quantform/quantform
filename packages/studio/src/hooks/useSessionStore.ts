import create from 'zustand';

import { BalanceModel, OrderModel, PositionModel } from '../models';

interface SessionState {
  balances: BalanceModel[];
  orders: OrderModel[];
  positions: PositionModel[];
}

export const useSessionStore = create<SessionState>(set => ({
  balances: [
    {
      key: 'sdf',
      adapter: 'BINANCE',
      asset: 'BTC-USDT',
      free: '1.0',
      locked: '0.04',
      timestamp: 3
    }
  ],
  orders: [
    {
      key: 'dvd',
      instrument: 'BINANCE:BTC-USDT',
      createdAt: 3,
      isBuy: true,
      quantity: '0.3',
      quantityExecuted: '0',
      state: 'PENDING',
      timestamp: 5
    }
  ],
  positions: [
    {
      key: 'fddf',
      averageExecutionRate: '3.444',
      instrument: 'BTC-USDT',
      leverage: 2,
      mode: 'CROSS',
      size: '1.000',
      timestamp: 4
    }
  ]
}));
