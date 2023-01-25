import { retry } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
const WebSocket = require('ws');

export function useSocket(url: string) {
  return webSocket({
    url,
    WebSocketCtor: WebSocket
  }).pipe(
    retry({
      delay: 100
    })
  );
}
