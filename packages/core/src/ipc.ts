import { AdapterFeedCommand } from './adapter';
import { Session, SessionDescriptor } from './session';
import { instrumentOf } from './domain';
import { Topic, event, handler } from './shared/topic';
import { Logger } from './shared';
import { backtest, idle, live, paper } from './bin';
import { BacktesterStreamer } from './adapter/backtester';
import { EventEmitter } from 'events';
import minimist = require('minimist');

export const ipcSub = new EventEmitter();

/**
 * Base command/query interface for IPC communication.
 */
export interface IpcCommand {
  /**
   * The command name to handle.
   */
  type;
}

/**
 * Command to start a new live session.
 */
@event
export class IpcLiveCommand implements IpcCommand {
  type = 'live';

  /**
   * The optional session identifier.
   */
  id?: number;
}

/**
 * Command to start a new paper session.
 */
@event
export class IpcPaperCommand implements IpcCommand {
  type = 'paper';

  /**
   * The optional session identifier.
   */
  id?: number;

  /**
   * Specifies trading balance, for example:
   * { "binance:usdt": 1000 }
   */
  balance: { [key: string]: number };
}

/**
 * Command to start a new backtest session.
 */
@event
export class IpcBacktestCommand implements IpcCommand {
  type = 'backtest';

  /**
   * Start date of the backtest in unix timestamp.
   */
  from: number;

  /**
   * Due date of the backtest in unix timestamp.
   */
  to: number;

  /**
   * Specifies trading balance, for example:
   * { "binance:usdt": 1000 }
   */
  balance: { [key: string]: number };
}

@event
export class IpcUniverseQuery implements IpcCommand {
  type = 'universe';
  exchange: string;
}

/**
 * Feeds specific session descriptor with instrument data.
 */
@event
export class IpcFeedCommand implements IpcCommand {
  type = 'feed';

  /**
   * Instrument to feed.
   */
  instrument: string;

  /**
   * Start date of the feed in unix timestamp.
   */
  from: number;

  /**
   * Due date of the feed in unix timestamp.
   */
  to: number;
}

/**
 * Stores current session instance.
 */
class IpcSessionAccessor {
  session: Session;
}

/**
 * Inter process communication handler.
 */
class IpcHandler extends Topic<{ type: string }, IpcSessionAccessor> {
  constructor(private readonly descriptor: SessionDescriptor) {
    super();
  }

  /**
   * @see IpcLiveCommand
   */
  @handler(IpcLiveCommand)
  async onLiveMode(command: IpcLiveCommand, accessor: IpcSessionAccessor) {
    if (command.id) {
      this.descriptor.id = command.id;
    }

    accessor.session = live(this.descriptor);

    this.notify({
      type: 'live:started',
      session: accessor.session.descriptor?.id
    });

    await accessor.session.awake();
  }

  /**
   * @see IpcPaperCommand
   */
  @handler(IpcPaperCommand)
  async onPaperMode(command: IpcPaperCommand, accessor: IpcSessionAccessor) {
    if (command.id) {
      this.descriptor.id = command.id;
    }

    accessor.session = paper(this.descriptor, {
      balance: command.balance
    });

    this.notify({
      type: 'paper:started',
      session: accessor.session.descriptor?.id
    });

    await accessor.session.awake();
  }

  /**
   * @see IpcBacktestCommand
   */
  @handler(IpcBacktestCommand)
  onBacktestMode(command: IpcBacktestCommand, accessor: IpcSessionAccessor) {
    return new Promise<void>(async resolve => {
      const [session, streamer] = backtest(this.descriptor, {
        from: command.from,
        to: command.to,
        balance: command.balance,
        listener: {
          onBacktestStarted: (streamer: BacktesterStreamer) => {
            this.notify({
              type: 'backtest:started',
              session: session.descriptor?.id,
              timestamp: streamer.timestamp,
              from: command.from,
              to: command.to
            });
          },
          onBacktestUpdated: (streamer: BacktesterStreamer) => {
            this.notify({
              type: 'backtest:updated',
              session: session.descriptor?.id,
              timestamp: streamer.timestamp,
              from: command.from,
              to: command.to
            });
          },
          onBacktestCompleted: async (streamer: BacktesterStreamer) => {
            await accessor.session.dispose();

            this.notify({
              type: 'backtest:completed',
              session: session.descriptor?.id,
              timestamp: streamer.timestamp,
              from: command.from,
              to: command.to
            });

            resolve();
          }
        }
      });

      accessor.session = session;

      await accessor.session.awake();
      await streamer.tryContinue().catch(it => Logger.error(it));
    });
  }

  /**
   * @see IpcUniverseQuery
   */
  @handler(IpcUniverseQuery)
  onUniverse(query: IpcUniverseQuery, accessor: IpcSessionAccessor) {
    accessor.session = accessor.session ?? idle(this.descriptor);
  }

  /**
   * @see IpcFeedCommand
   */
  @handler(IpcFeedCommand)
  async onFeed(command: IpcFeedCommand, accessor: IpcSessionAccessor) {
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

  /**
   * Sends a message to parent process.
   */
  private notify(message: any) {
    if (process.send) {
      process.send(message);
    }

    ipcSub.emit('message', message);
  }
}

/**
 * Starts new managed session and subscribes to parent process messages.
 * @param descriptor session descriptor.
 * @param commands collection of commands to execute before session is started.
 * @returns new session.
 */
export async function run(
  descriptor: SessionDescriptor,
  ...commands: IpcCommand[]
): Promise<Session> {
  const handler = new IpcHandler(descriptor);
  const accessor = new IpcSessionAccessor();
  const argv = minimist(process.argv.slice(2));

  if (argv.command) {
    const json = Buffer.from(argv.command, 'base64').toString('utf-8');

    commands.push(JSON.parse(json));
  } else {
    if (!commands.length) {
      commands.push(new IpcPaperCommand());
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
