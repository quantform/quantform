import { z } from 'zod';

import { whenEvent } from './when-event';

export function whenBlock() {
  return whenEvent('block', z.number());
}
