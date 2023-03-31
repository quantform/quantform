import ReconnectingWebSocket from 'reconnecting-websocket';
import { Observable } from 'rxjs';
import WebSocket from 'ws';
import { z, ZodType } from 'zod';

import { useLogger } from './use-logger';

export const connected = Symbol('connection opened');
export const disconnected = Symbol('connection closed');

export function useSocket<T extends ZodType>(
  messageType: T,
  url: string
): [
  Observable<z.infer<typeof messageType> | typeof connected | typeof disconnected>,
  (message: unknown) => void
] {
  const socket = new ReconnectingWebSocket(url, [], {
    WebSocket
  });

  const { debug } = useLogger('useSocket');

  const message = new Observable<z.infer<typeof messageType>>(stream => {
    socket.onmessage = it => stream.next(messageType.parse(JSON.parse(it.data)));
    socket.onerror = it => stream.error(it);
    socket.onclose = () => stream.next(disconnected);
    socket.onopen = () => {
      // eslint-disable-next-line no-underscore-dangle
      const ws = (socket as any)._ws as WebSocket;

      if (!ws.listeners('ping').length) {
        ws.on('ping', () => {
          debug('received ping', url);
          ws.pong();
        });
      }

      stream.next(connected);
    };

    return () => socket.close();
  });

  return [message, (message: unknown) => socket.send(JSON.stringify(message))];
}
