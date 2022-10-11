import { useEffect } from 'react';

import { SessionContract } from '../models/SessionModel';
import { useMeasurementStore } from './useMeasurementStore';
import { useSessionStore } from './useSessionStore';

async function query(
  signal: AbortSignal,
  timestamp: number,
  handler: (response: any) => void
) {
  try {
    const response = await fetch(`/api?timestamp=${timestamp}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal
    });

    handler(await response.json());
  } catch (e) {
    console.log(e);
  }

  if (signal.aborted) {
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  await query(signal, timestamp, handler);
}

export function useServerStreaming() {
  const session = useSessionStore();
  const measurement = useMeasurementStore();

  useEffect(() => {
    const controller = new AbortController();

    query(controller.signal, session.timestamp, response => {
      session.upsert(SessionContract.parse(response.session));
      measurement.upsert(response.measurement);
    });

    return () => controller.abort();
  }, [session.upsert, measurement.upsert]);
}
