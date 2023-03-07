import { Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import WebSocket from 'ws';

export function useSocket(
  url: string
): [Observable<unknown>, (message: unknown) => void] {
  const socket = webSocket({
    url,
    WebSocketCtor: WebSocket as any,
    openObserver: {
      next: () => console.log('opened', url)
    }
  });

  return [socket.asObservable(), (message: unknown) => socket.next(message)];
}
