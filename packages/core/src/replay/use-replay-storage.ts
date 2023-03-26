import { storageObject, useStorage } from '@lib/storage';

export const replaySerializableObject = (key: string) =>
  storageObject<{ timestamp: number; json: string }>(key);

export function useReplayStorage() {
  return useStorage(['replay']);
}
