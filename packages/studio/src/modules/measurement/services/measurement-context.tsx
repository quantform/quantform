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
