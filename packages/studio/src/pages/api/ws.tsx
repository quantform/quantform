import { Server } from 'socket.io';
import { Layout } from '../../modules/charting/charting-layout';
import { transformLayout } from '../../modules/charting/charting-layout-transformer';
import { getSession } from '../../modules/session/session-accessor';
import { SessionSnapshot } from '../../modules/session/session-snapshot';

const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    const session = getSession();
    const descriptor = session.descriptor as any;
    const layout = descriptor.layout as Layout;
    const snapshot = new SessionSnapshot(session);

    io.on('connection', socket => socket.emit('snapshot', snapshot.getSnapshot()));

    setInterval(() => {
      const changes = snapshot.getChanges();

      if (changes) {
        io.emit('changes', {
          components: changes.components,
          measurements: transformLayout(changes.measurements, layout)
        });
      }
    }, 100);

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
