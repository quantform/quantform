import { useSession } from '@lib/session';
import { useStorage } from '@lib/storage';
import { useMemo } from '@lib/use-memo';

export function useSessionStorage() {
  return useMemo(() => {
    const { id } = useSession();

    return useStorage(['session', id]);
  }, [useSessionStorage.name]);
}
