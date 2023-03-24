import { serializableObject, useStorage } from '@lib/storage';

export const replaySerializableObject = (key: string) =>
  serializableObject<{ timestamp: number; json: string }>(key);

export function useReplayStorage() {
  return useStorage(['replay']);
}
