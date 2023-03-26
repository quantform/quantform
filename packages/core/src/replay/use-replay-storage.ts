import { storageObject, useStorage } from '@lib/storage';

export const replaySerializableObject = (key: string) =>
  storageObject(key, { timestamp: 'number', json: 'string' });

export function useReplayStorage() {
  return useStorage(['replay']);
}
