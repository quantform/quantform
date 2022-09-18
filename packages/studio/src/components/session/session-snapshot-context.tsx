import { createContext, useContext, useReducer } from 'react';

import { SessionSnapshotContextState } from './session-snapshot-models';

export type SessionSnapshotContextType = SessionSnapshotContextState & {
  dispatch: React.Dispatch<SessionActions>;
};

export type SetSessionSnapshotAction = SessionSnapshotContextState & {
  type: 'snapshot';
};

export type PatchSessionSnapshotAction = SessionSnapshotContextState & {
  type: 'patch';
};

export type SessionActions = SetSessionSnapshotAction | PatchSessionSnapshotAction;

const SessionSnapshotContext = createContext<SessionSnapshotContextType>({
  balance: {},
  orders: {},
  positions: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {}
});

export const useSessionSnapshotContext = () => useContext(SessionSnapshotContext);

const reduceSessionSnapshot = (
  state: SessionSnapshotContextState,
  action: SessionActions
): SessionSnapshotContextState => {
  switch (action.type) {
    case 'snapshot':
      return {
        balance: action.balance ?? {},
        orders: action.orders ?? {},
        positions: action.positions ?? {}
      };
    case 'patch':
      return {
        balance: { ...state.balance, ...(action.balance ?? {}) },
        orders: { ...state.orders, ...(action.orders ?? {}) },
        positions: { ...state.positions, ...(action.positions ?? {}) }
      };
  }
};

export const SessionSnapshotProvider = ({ children }: { children: React.ReactNode }) => {
  const [snapshot, dispatch] = useReducer(reduceSessionSnapshot, {
    balance: {},
    orders: {},
    positions: {}
  } as SessionSnapshotContextState);

  const value = {
    ...snapshot,
    dispatch
  };

  return (
    <SessionSnapshotContext.Provider value={value}>
      {children}
    </SessionSnapshotContext.Provider>
  );
};
