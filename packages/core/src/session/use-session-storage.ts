import { useSession } from '@lib/session';
import { useStorage } from '@lib/storage';
import { use } from '@lib/use';

export const useSessionStorage = use(() => {
  const { id } = useSession();

  return useStorage(['session', id]);
});
