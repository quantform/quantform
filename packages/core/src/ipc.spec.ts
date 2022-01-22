import { Adapter, AdapterContext } from './adapter';
import { PaperAdapter, PaperSpotExecutor } from './adapter/paper';
import { PaperExecutor } from './adapter/paper/executor/paper-executor';
import { run } from './ipc';
import { task } from './shared';
import { EventEmitter } from 'events';
import { of, take, tap } from 'rxjs';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return new PaperSpotExecutor(adapter);
  }

  awake(context: AdapterContext): Promise<void> {
    return super.awake(context);
  }

  async account(): Promise<void> {}
}

describe('ipc feed tests', () => {
  test('should dispatch session started event', done => {
    const command = {
      type: 'paper'
    };

    const ipcSub = new EventEmitter();

    ipcSub.on('message', (message: any) => {
      expect(message.type).toBe('paper:started');
      done();
    });

    run(
      {
        adapter: [new DefaultAdapter()],
        ipcSub,
        options: {
          paper: {
            balance: { 'default:usd': 100 }
          }
        }
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
        adapter: [new DefaultAdapter()]
      },
      command
    );
  });
});
