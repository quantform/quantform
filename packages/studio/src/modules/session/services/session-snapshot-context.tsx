import { createContext, useContext, useReducer, useState } from 'react';

export interface ISnapshotComponent {
  key: string;
}

export function createSnapshotContext<T extends ISnapshotComponent>(
  initialValue: Record<string, T>
): [
  () => {
    snapshot: Record<string, T>;
    dispatch: (action: { type: string; elements: T[] }) => void;
  },
  (children: any) => JSX.Element
] {
  const Context = createContext<{
    snapshot: Record<string, T>;
    dispatch: (f: any) => void;
  }>({
    snapshot: initialValue,
    dispatch: () => {}
  });

  const useSnapshotContext = () => {
    return useContext(Context);
  };

  const snapshotProvider = ({ children }) => {
    const reducer = (
      state: Record<string, T>,
      action: { type: string; elements: T[] }
    ) => {
      switch (action.type) {
        case 'snapshot':
          return Object.values(action.elements).reduce((acc, cur) => {
            acc[cur.key] = cur;
            return acc;
          }, {});
        case 'patch':
          const copy = Object.assign({}, state);

          action.elements.forEach(it => (copy[it.key] = it));

          return copy;
        default:
          return state;
      }
    };

    const [state, dispatch] = useReducer(reducer, initialValue);

    const value = {
      snapshot: state,
      dispatch
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  return [useSnapshotContext, snapshotProvider];
}
