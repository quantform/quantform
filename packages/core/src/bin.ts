import {
  BacktesterAdapter,
  BacktesterOptions,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate, AdapterFeedCommand } from './adapter';
import { PaperAdapter, PaperOptions } from './adapter/paper';
import { Session, SessionDescriptor } from './session';
import { Store } from './store';
import { instrumentOf } from './domain';
import { Topic, event, handler } from './shared/topic';
import minimist = require('minimist');
import { Logger } from './shared';

export interface IpcCommand {
  type;
}

@event
export class IpcPaperModeCommand implements IpcCommand {
  type = 'paper';
  id?: number;
  balance: { [key: string]: number };
}

@event
export class IpcBacktestModeCommand implements IpcCommand {
  type = 'backtest';
  from: number;
  to: number;
  balance: { [key: string]: number };
}

@event
export class IpcLiveModeCommand implements IpcCommand {
  id?: number;
  type = 'live';
}

@event
export class IpcUniverseQuery implements IpcCommand {
  type = 'universe';
  exchange: string;
}

@event
export class IpcFeedCommand implements IpcCommand {
  type = 'feed';
  instrument: string;
  from: number;
  to: number;
}

class ExecutionAccessor {
  session: Session;
}

class ExecutionHandler extends Topic<{ type: string }, ExecutionAccessor> {
  constructor(private readonly descriptor: SessionDescriptor) {
    super();
  }

  @handler(IpcLiveModeCommand)
  async onLiveMode(command: IpcLiveModeCommand, accessor: ExecutionAccessor) {
    if (command.id) {
      this.descriptor.id = command.id;
    }

    accessor.session = live(this.descriptor);

    await accessor.session.awake();
  }

  @handler(IpcPaperModeCommand)
  async onPaperMode(command: IpcPaperModeCommand, accessor: ExecutionAccessor) {
    if (command.id) {
      this.descriptor.id = command.id;
    }

    accessor.session = paper(this.descriptor, {
      balance: command.balance
    });

    await accessor.session.awake();
  }

  @handler(IpcBacktestModeCommand)
  onBacktestMode(command: IpcBacktestModeCommand, accessor: ExecutionAccessor) {
    return new Promise<void>(async resolve => {
      const [session, streamer] = backtest(this.descriptor, {
        from: command.from,
        to: command.to,
        balance: command.balance,
        progress: timestamp =>
          this.notify({
            type: 'backtest:updated',
            timestamp,
            from: command.from,
            to: command.to
          }),
        completed: async () => {
          const statement = {};

          await accessor.session.dispose();

          this.notify({ type: 'backtest:completed', statement });

          resolve();
        }
      });

      accessor.session = session;

      this.notify({ type: 'backtest:started' });

      await accessor.session.awake();
      await streamer.tryContinue().catch(it => Logger.error(it));
    });
  }

  @handler(IpcUniverseQuery)
  onUniverse(query: IpcUniverseQuery, accessor: ExecutionAccessor) {
    accessor.session = accessor.session ?? idle(this.descriptor);
  }

  @handler(IpcFeedCommand)
  async onFeed(command: IpcFeedCommand, accessor: ExecutionAccessor) {
    accessor.session = accessor.session ?? idle(this.descriptor);
    const instrument = instrumentOf(command.instrument);

    await accessor.session.awake();

    this.notify({ type: 'feed:started' });

    await accessor.session.aggregate.dispatch(
      instrument.base.exchange,
      new AdapterFeedCommand(
        instrument,
        command.from,
        command.to,
        this.descriptor.feed,
        timestamp =>
          this.notify({
            type: 'feed:updated',
            timestamp,
            from: command.from,
            to: command.to
          })
      )
    );

    this.notify({ type: 'feed:completed' });

    await accessor.session.dispose();
  }

  private notify(message: any) {
    if (!process.send) {
      return;
    }

    process.send(message);
  }
}

export async function run(
  descriptor: SessionDescriptor,
  ...commands: IpcCommand[]
): Promise<Session> {
  const handler = new ExecutionHandler(descriptor);
  const accessor = new ExecutionAccessor();
  const argv = minimist(process.argv.slice(2));

  if (argv.command) {
    const json = Buffer.from(argv.command, 'base64').toString('utf-8');

    commands.push(JSON.parse(json));
  } else {
    if (!commands.length) {
      commands.push(new IpcPaperModeCommand());
    }
  }

  for (const command of commands) {
    await handler.dispatch(command, accessor);
  }

  process.on('message', async (request: any) => {
    const response = await handler.dispatch(request, accessor);

    if (response) {
      process.send(response);
    }
  });

  return accessor.session;
}

export function backtest(
  descriptor: SessionDescriptor,
  options: BacktesterOptions
): [Session, BacktesterStreamer] {
  const store = new Store();

  const streamer = new BacktesterStreamer(store, descriptor.feed, options);
  const aggregate = new AdapterAggregate(
    store,
    descriptor.adapter.map(
      it => new PaperAdapter(new BacktesterAdapter(it, streamer), store, options)
    )
  );

  return [new Session(store, aggregate, descriptor), streamer];
}

export function paper(descriptor: SessionDescriptor, options: PaperOptions): Session {
  const store = new Store();

  const aggregate = new AdapterAggregate(
    store,
    descriptor.adapter.map(it => new PaperAdapter(it, store, options))
  );

  return new Session(store, aggregate, descriptor);
}

export function live(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const aggregate = new AdapterAggregate(store, descriptor.adapter);

  return new Session(store, aggregate, descriptor);
}

export function idle(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const aggregate = new AdapterAggregate(store, descriptor.adapter);

  return new Session(store, aggregate);
}
