import { Observable } from 'rxjs';
import { WebSocket } from 'ws';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export function whenSocket(
  url: string,
  options: { pingInterval?: number } = { pingInterval: 5000 }
): [Observable<{ timestamp: number; payload: unknown }>, (message: unknown) => void] {
  const { debug } = useLogger('whenSocket');

  const message = new Observable<{ timestamp: number; payload: unknown }>(stream => {
    const socket = new WebSocket(url);
    let isAlive = false;
    let interval: NodeJS.Timeout | undefined;

    socket.onmessage = it =>
      stream.next({ timestamp: useTimestamp(), payload: JSON.parse(it.data as string) });
    socket.onerror = it => {
      clearInterval(interval);
      debug('errored', url);
      stream.error(it);
    };
    socket.onclose = () => {
      debug('closed', url);
      clearInterval(interval);
      stream.error();
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
      }, options.pingInterval);

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
