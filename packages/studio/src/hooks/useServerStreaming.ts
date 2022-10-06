import { useEffect } from 'react';

async function query(signal: AbortSignal, handler: (response: any) => void) {
  try {
    const response = await fetch('/api', {
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
  await query(signal, handler);
}

export function useServerStreaming() {
  useEffect(() => {
    const controller = new AbortController();

    query(controller.signal, response => console.log(response));

    return () => controller.abort();
  }, []);
}
