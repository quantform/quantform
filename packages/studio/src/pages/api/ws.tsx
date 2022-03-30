import { Balance, Component, Order, State } from '@quantform/core';
import { filter, map, tap } from 'rxjs';
import { Server } from 'socket.io';
import { getBalanceSnapshot } from '../../modules/balance/service';
import { getOrderSnapshot } from '../../modules/order/services';
import { getSession } from '../../modules/session/session-accessor';

function getSnapshot(state: State) {
  const { balance, order } = state;

  return {
    balance: Object.values(balance).map(getBalanceSnapshot),
    orders: Object.values(order).map(getOrderSnapshot)
  };
}

function getSnapshotPatch(component: Component) {
  switch (component.kind) {
    case 'balance':
      return getBalanceSnapshot(component as Balance);
    case 'order':
      return getOrderSnapshot(component as Order);
  }
}

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on('connection', socket => {
      const session = getSession();
      const snapshot = getSnapshot(session.store.snapshot);

      socket.emit('snapshot', snapshot);
    });

    getSession()
      .store.changes$.pipe(
        map(getSnapshotPatch),
        filter(it => it != undefined),
        tap(it => io.emit('patch', [it]))
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
