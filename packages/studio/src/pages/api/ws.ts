import { Balance, Order, Orderbook } from '@quantform/core';
import { filter, map, tap } from 'rxjs';
import { Server } from 'socket.io';
import sessionAccessor from './../../session';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on('connection', socket => {
      const balance = Object.values(sessionAccessor.session.store.snapshot.balance).map(
        it => ({
          key: it.asset.toString(),
          asset: it.asset.name,
          adapter: it.asset.adapter,
          free: it.free,
          locked: it.locked,
          scale: it.asset.scale
        })
      );

      const orders = Object.values(sessionAccessor.session.store.snapshot.order).map(
        it => ({
          ...it,
          key: it.id,
          instrument: it.instrument.toString()
        })
      );

      socket.emit('snapshot', {
        balance,
        orders
      });
    });

    sessionAccessor.session.store.changes$
      .pipe(
        filter(it => it.kind == 'balance'),
        map(it => it as Balance),
        tap(it => {
          io.emit('patch', {
            balance: {
              key: it.asset.toString(),
              asset: it.asset.name,
              adapter: it.asset.adapter,
              free: it.free,
              locked: it.locked,
              scale: it.asset.scale
            }
          });
        })
      )
      .subscribe();

    sessionAccessor.session.store.changes$
      .pipe(
        filter(it => it.kind == 'order'),
        map(it => it as Order),
        tap(it => {
          io.emit('patch', {
            order: {
              ...it,
              key: it.id,
              instrument: it.instrument.toString()
            }
          });
        })
      )
      .subscribe();

    res.socket.server.io = io;
  } else {
    console.log('socket.io already running');
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default ioHandler;
