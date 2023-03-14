import { useStorage } from '@lib/storage';

export function useReplayStorage() {
  return useStorage(['replay']);
}
