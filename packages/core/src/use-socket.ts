import { Observable } from 'rxjs';
import { WebSocket } from 'ws';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export function useSocket(
  url: string
): [Observable<{ timestamp: number; payload: unknown }>, (message: unknown) => void] {
  const { debug } = useLogger('useSocket');

  const message = new Observable<{ timestamp: number; payload: unknown }>(stream => {
    const socket = new WebSocket(url);
    let isAlive = false;
    let interval: NodeJS.Timer | undefined;

    socket.onmessage = it =>
      stream.next({ timestamp: useTimestamp(), payload: JSON.parse(it.data as string) });
    socket.onerror = it => {
      clearInterval(interval);
      stream.error(it);
    };
    socket.onclose = () => {
      debug('closed', url);
      clearInterval(interval);
      stream.complete();
    };
    socket.onopen = () => {
      debug('opened', url);
      isAlive = true;
      interval = setInterval(() => {
        if (isAlive) {
          isAlive = false;

          socket.ping();
        } else {
          socket.terminate();
          clearInterval(interval);
        }
      }, 5000);

      socket.on('pong', () => {
        isAlive = true;
      });

      socket.on('ping', () => {
        isAlive = true;
        socket.pong();
      });
    };

    return () => {
      socket.terminate();
      clearInterval(interval);
    };
  });

  return [message, (message: unknown) => JSON.stringify(message)];
}
