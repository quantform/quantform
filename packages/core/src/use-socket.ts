import ReconnectingWebSocket from 'reconnecting-websocket';
import { Observable } from 'rxjs';
import WebSocket from 'ws';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export function useSocket(
  url: string
): [Observable<{ timestamp: number; payload: unknown }>, (message: unknown) => void] {
  const socket = new ReconnectingWebSocket(url, [], {
    WebSocket
  });

  const { debug } = useLogger('useSocket');

  const message = new Observable<{ timestamp: number; payload: unknown }>(stream => {
    socket.onmessage = it =>
      stream.next({ timestamp: useTimestamp(), payload: JSON.parse(it.data) });
    socket.onerror = it => stream.error(it);
    socket.onclose = () => stream.complete();
    socket.onopen = () => {
      // eslint-disable-next-line no-underscore-dangle
      const ws = (socket as any)._ws as WebSocket;

      if (!ws.listeners('ping').length) {
        ws.on('ping', () => {
          debug('received ping', url);
          ws.pong();
        });
      }
    };

    return () => socket.close();
  });

  return [message, (message: unknown) => socket.send(JSON.stringify(message))];
}
