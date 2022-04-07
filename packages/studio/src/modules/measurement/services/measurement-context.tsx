import { createContext, useContext, useReducer, useState } from 'react';
import { appendLayoutProps, LayoutProps } from './measurement-transformer';

export interface MeasurementC {}

const MeasurementContext = createContext<{
  measurement: LayoutProps;
  dispatch: (f: { type: string; payload: LayoutProps }) => void;
}>({
  measurement: {},
  dispatch: () => {}
});

export const useMeasurementContext = () => {
  return useContext(MeasurementContext);
};

const measurementReducer = (
  state: LayoutProps,
  action: { type: string; payload: LayoutProps }
) => {
  switch (action.type) {
    case 'snapshot':
      return action.payload;
    case 'patch':
      return appendLayoutProps(state, action.payload);
  }

  return state;
};

export const MeasurementProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(measurementReducer, {});

  const value = {
    measurement: state,
    dispatch
  };

  return (
    <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>
  );
};
