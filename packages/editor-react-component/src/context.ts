import socketIOClient from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { debounce, map } from 'rxjs/operators';

export interface Measure {
  timestamp: number;
  type: string;
  [key: string]: any;
}

export class Context {
  private socket?: Socket;
  cache: Measure[];
  private readonly serie = new ReplaySubject<Measure[]>(1);
  private readonly range = new ReplaySubject<any>(1);

  get serie$(): Observable<Measure[]> {
    return this.serie.asObservable();
  }

  get viewport$(): Observable<any> {
    return this.range.asObservable();
  }

  setViewport(range: any) {
    this.range.next(range);
  }

  constructor(private readonly address: string, private readonly session: string) {
    this.viewport$.pipe(
      debounce(() => interval(400)),
      map(it => {
        const barsInfo = Object.values(this.serie)
          .map(serie => serie.barsInLogicalRange(it))
          .filter(it => it != null);

        if (!barsInfo) {
          return;
        }

        const minBarsBefore = Math.max(...barsInfo.map(it => it.barsBefore));
        const maxBarsBefore = Math.min(...barsInfo.map(it => it.barsAfter));

        if (minBarsBefore !== null && maxBarsBefore !== null) {
          if (minBarsBefore < maxBarsBefore) {
            this.prepend();
            console.log('prepend');
          } else {
            this.append();
            console.log('append');
          }
        }
      })
    );
  }

  connect() {
    this.socket = socketIOClient(this.address, {
      transports: ['websocket', 'polling', 'flashsocket']
    });

    this.socket.on('session:backtest:started', it => {
      console.log(it);
    });

    this.socket.on('session:backtest:done', it => {
      this.socket?.emit('timeserie', {
        session: it.session,
        descriptor: it.descriptor,
        timestamp: new Date().getTime(),
        forward: false
      });
    });

    this.socket.on('timeserie', data => {
      if (!data.measure.length) {
        return;
      }

      console.log('up');

      if (this.cache) {
        this.cache = this.cache
          .concat(data.measure)
          .sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
      } else {
        this.cache = data.measure;
      }

      this.serie.next(this.cache);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  prepend() {
    if (!this.cache) {
      return;
    }

    this.socket?.emit('timeserie', {
      session: this.session,
      timestamp: this.cache[0].timestamp,
      forward: false
    });
  }

  append() {
    if (!this.cache) {
      return;
    }

    this.socket?.emit('timeserie', {
      session: this.session,
      timestamp: this.cache[this.cache.length - 1].timestamp,
      forward: true
    });
  }
}