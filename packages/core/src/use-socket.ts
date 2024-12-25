import { defer, Observable, of } from 'rxjs';
import { WebSocket } from 'ws';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export function useSocket(
  url: string,
  options: { pingInterval?: number } = { pingInterval: 5000 }
) {
  const { debug } = useLogger('useSocket');
  const socket = new WebSocket(url);

  return {
    /**
     * Observes socket events and handles connection health monitoring via ping/pong
     * @returns observable emitting message events with timestamps and parsed payloads
     */
    watch(): Observable<{ timestamp: number; payload: unknown }> {
      let isAlive = false;
      let interval: NodeJS.Timeout | undefined;

      return new Observable(stream => {
        socket.onmessage = it =>
          stream.next({
            timestamp: useTimestamp(),
            payload: JSON.parse(it.data as string)
          });
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
          clearInterval(interval);
          socket.terminate();
        };
      });
    },

    send(message: { payload: unknown }): Observable<{ timestamp: number }> {
      return defer(() => {
        socket.send(JSON.stringify(message.payload));

        return of({ timestamp: useTimestamp() });
      });
    }
  };
}
