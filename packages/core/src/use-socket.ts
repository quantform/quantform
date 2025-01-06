import { defer, Observable, of, ReplaySubject } from 'rxjs';
import { WebSocket } from 'ws';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export function useSocket(
  url: string,
  options: { pingInterval?: number } = { pingInterval: 5000 }
) {
  const { debug } = useLogger('useSocket');
  const socket = new WebSocket(url);
  const monitor = new ReplaySubject<'opened' | 'closed' | 'errored'>();

  socket.on('error', e => {
    debug('errored', url, e);
    monitor.next('errored');
  });

  socket.on('close', () => {
    debug('closed', url);
    monitor.next('closed');
  });

  socket.on('open', () => {
    debug('opened', url);
    monitor.next('opened');
  });

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
          stream.error(it);
        };
        socket.onclose = () => {
          clearInterval(interval);
          stream.error();
        };
        socket.onopen = () => {
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
        debug('sent', url, message.payload);

        socket.send(JSON.stringify(message.payload));

        return of({ timestamp: useTimestamp() });
      });
    },

    monitor() {
      return monitor.asObservable();
    }
  };
}
