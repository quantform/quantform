import { decimal, InstrumentSelector } from '@quantform/core';

import { useOrderExecution } from './use-order-execution';

export const useOrderRisk = (id: string, instrument: InstrumentSelector, rate: decimal) =>
  useOrderExecution(id, instrument, rate);
