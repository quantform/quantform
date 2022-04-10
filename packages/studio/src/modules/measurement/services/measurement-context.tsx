import { createContext, useContext, useReducer, useState } from 'react';
import { appendLayoutProps, LayoutProps } from './measurement-transformer';

export interface MeasurementC {}

const MeasurementContext = createContext<{
  measurement: { snapshot: LayoutProps; patched: LayoutProps };
  dispatch: (f: { type: string; payload: LayoutProps }) => void;
}>({
  measurement: { snapshot: {}, patched: {} },
  dispatch: () => {}
});

export const useMeasurementContext = () => {
  return useContext(MeasurementContext);
};

const measurementReducer = (
  state: { snapshot: LayoutProps; patched: LayoutProps },
  action: { type: string; payload: LayoutProps }
) => {
  switch (action.type) {
    case 'snapshot':
      return { snapshot: action.payload, patched: {} };
    case 'patch':
      return {
        snapshot: appendLayoutProps(state.snapshot, action.payload),
        patched: action.payload
      };
    case 'merge':
      for (const key in action.payload) {
        if (!state.snapshot[key]) {
          state.snapshot[key] = action.payload[key];
        } else {
          state.snapshot[key].series = state.snapshot[key].series
            .concat(action.payload[key].series)
            .sort((lhs, rhs) => lhs.time - rhs.time)
            .filter((it, idx, array) => {
              const prev = array[idx - 1];

              return !prev || !(it.time === prev.time);
            });

          state.snapshot[key].markers = state.snapshot[key].markers
            .concat(action.payload[key].markers)
            .sort((lhs, rhs) => lhs.time - rhs.time)
            .filter((it, idx, array) => {
              const prev = array[idx - 1];

              return !prev || !(it.time === prev.time);
            });
        }
      }

      return { snapshot: state.snapshot, patched: {} };
  }

  return state;
};

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(measurementReducer, {
    snapshot: {},
    patched: {}
  });

  const value = {
    measurement: state,
    dispatch
  };

  return (
    <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>
  );
};
