import { Storage, useStorage } from '@lib/storage';

export const replaySerializableObject = (key: string) =>
  Storage.createObject(key, { timestamp: 'number', json: 'string' });

export function useReplayStorage() {
  return useStorage(['replay']);
}
