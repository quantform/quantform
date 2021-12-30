import { Session } from './session';
import {
  Adapter,
  AdapterFeedCommand,
  AdapterAwakeCommand,
  AdapterAccountCommand,
  AdapterSubscribeCommand,
  AdapterDisposeCommand
} from './adapter';
import { PaperAdapter, PaperSpotExecutor } from './adapter/paper';
import { PaperExecutor } from './adapter/paper/executor/paper-executor';
import { run } from './ipc';
import { Feed, InMemoryStorage } from './storage';
import { instrumentOf } from './domain';
import { handler, task } from './shared';
import { EventEmitter } from 'events';
import { from, of, take, tap } from 'rxjs';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return new PaperSpotExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand) {}

  @handler(AdapterDisposeCommand)
  onDispose(command: AdapterDisposeCommand) {}

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand) {}

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAccountCommand) {}

  @handler(AdapterFeedCommand)
  onFeed(command: AdapterFeedCommand) {}
}

describe('ipc feed tests', () => {
  test('should trigger adapter feed command', async () => {
    const command = {
      type: 'feed',
      instrument: 'default:btc-usdt',
      from: 0,
      to: 100
    };

    const session = await run(
      {
        adapter: [new DefaultAdapter()],
        feed: new Feed(new InMemoryStorage()),
        describe: (session: Session) => session.trade(instrumentOf('default:btc-usdt'))
      },
      command
    );

    //expect(session.descriptor).toBeUndefined();
  });

  test('should dispatch session started event', done => {
    const command = {
      type: 'paper',
      balance: { 'default:usd': 100 }
    };

    const ipcSub = new EventEmitter();

    ipcSub.on('message', (message: any) => {
      expect(message.type).toBe('paper:started');
      done();
    });

    run(
      {
        adapter: [new DefaultAdapter()],
        describe: (session: Session) => session.trade(instrumentOf('default:btc-usdt')),
        ipcSub
      },
      command
    );
  });

  test('should execute user task', done => {
    task('hello-world', session => {
      return of(1).pipe(
        take(1),
        tap(() => done())
      );
    });

    const command = {
      type: 'task',
      taskName: 'hello-world'
    };

    run(
      {
        adapter: [new DefaultAdapter()],
        describe: (session: Session) => session.trade(instrumentOf('default:btc-usdt'))
      },
      command
    );
  });
});
