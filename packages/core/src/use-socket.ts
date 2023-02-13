import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
const WebSocket = require('ws');

export function useSocket(
  url: string
): [Observable<unknown>, (message: unknown) => void] {
  const socket = webSocket({
    url,
    WebSocketCtor: WebSocket
  });

  return [
    socket.pipe(
      retry({
        delay: 100
      })
    ),
    (message: unknown) => socket.next(message)
  ];
}
