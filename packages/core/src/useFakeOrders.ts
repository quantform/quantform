import { InstrumentSelector } from '@lib/component';
import { useState } from '@lib/useState';

export function useFakeOrders(instrument: InstrumentSelector) {
  const orders = useState({}, [useFakeOrders.name, instrument.id]);
}
