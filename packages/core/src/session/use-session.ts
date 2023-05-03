import { withMemo } from '@lib/with-memo';

export const useSession = withMemo(() => ({
  id: 'ttt' //Date.now()
}));
