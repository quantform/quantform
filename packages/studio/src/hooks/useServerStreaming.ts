import { useEffect } from 'react';

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
  const { timestamp, upsertBalance } = useSessionStore();

  useEffect(() => {
    const controller = new AbortController();

    query(controller.signal, timestamp, response => {
      console.log(response);
      response.session.balances.forEach(it => upsertBalance(it));
    });

    return () => controller.abort();
  }, [timestamp, upsertBalance]);
}
