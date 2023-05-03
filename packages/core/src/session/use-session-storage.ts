import { useSession } from '@lib/session';
import { useStorage } from '@lib/storage';
import { withMemo } from '@lib/with-memo';

export const useSessionStorage = withMemo(() => {
  const { id } = useSession();

  return useStorage(['session', id]);
});
