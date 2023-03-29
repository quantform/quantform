import { of } from 'rxjs';

import { d, InstrumentSelector, use } from '@quantform/core';

export const useOrderSize = use((instrument: InstrumentSelector) => of(d(0.004)));
