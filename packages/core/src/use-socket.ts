import { filter, map, merge, Observable, retry, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import WebSocket from 'ws';
import { z, ZodType } from 'zod';

export const connected = Symbol('connection opened');
export const disconnected = Symbol('connection closed');

export function useSocket<T extends ZodType>(
  messageType: T,
  url: string
): [
  Observable<z.infer<typeof messageType> | typeof connected | typeof disconnected>,
  (message: unknown) => void
] {
  const opened = new Subject<typeof connected>();
  const closed = new Subject<typeof disconnected>();

  const socket = webSocket({
    url,
    WebSocketCtor: WebSocket as any,
    openObserver: {
      next: () => opened.next(connected)
    },
    closeObserver: {
      next: () => closed.next(disconnected)
    }
  });

  const message = socket.pipe(
    retry({
      delay: 100
    }),
    map(it => messageType.parse(it))
  );

  return [merge(message, opened, closed), (message: unknown) => socket.next(message)];
}

export function filterLifecycle<T>() {
  return (observable: Observable<T | typeof connected | typeof disconnected>) =>
    observable.pipe(
      filter(it => it !== connected && it !== disconnected),
      map(it => it as T)
    );
}
