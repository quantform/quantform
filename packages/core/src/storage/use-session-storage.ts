import { use } from '@lib/use';

import { useStorage } from './use-storage';

export const useSessionStorage = use(() => useStorage(['session', Date.now()]));
