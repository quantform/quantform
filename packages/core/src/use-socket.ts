import { filter, map, merge, Observable, retry, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import WebSocket from 'ws';
import { z, ZodType } from 'zod';

export const connectionOpened = Symbol('connection opened');
export const connectionClosed = Symbol('connection closed');

export function useSocket<T extends ZodType>(
  messageType: T,
  url: string
): [
  Observable<
    z.infer<typeof messageType> | typeof connectionOpened | typeof connectionClosed
  >,
  (message: unknown) => void
] {
  const opened = new Subject<typeof connectionOpened>();
  const closed = new Subject<typeof connectionClosed>();

  const socket = webSocket({
    url,
    WebSocketCtor: WebSocket as any,
    openObserver: {
      next: () => opened.next(connectionOpened)
    },
    closeObserver: {
      next: () => closed.next(connectionClosed)
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
  return (
    observable: Observable<T | typeof connectionOpened | typeof connectionClosed>
  ) =>
    observable.pipe(
      filter(it => it !== connectionOpened && it !== connectionClosed),
      map(it => it as T)
    );
}
