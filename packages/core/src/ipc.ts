import {
  BacktesterAdapter,
  BacktesterOptions,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate, AdapterFeedCommand } from './adapter';
import { PaperAdapter, PaperOptions } from './adapter/paper';
import { Session, SessionDescriptor } from './session';
import { Store } from './store';
import { instrumentOf, InstrumentSelector } from './domain';
import { Topic, event, handler } from './common/topic';
import minimist = require('minimist');

@event
class IpcUniverseQuery {
  type = 'universe';
  exchange: string;
}

@event
class IpcPaperModeCommand {
  type = 'paper';
}

@event
class IpcBacktestModeCommand {
  type = 'backtest';
  from: number;
  to: number;
}

@event
class IpcLiveModeCommand {
  type = 'live';
}

class IpcHandler extends Topic<{ type: string }> {
  constructor(private readonly descriptor: SessionDescriptor) {
    super();
  }

  @handler(IpcUniverseQuery)
  onUniverse(query: IpcUniverseQuery) {
    const session = idle(this.descriptor);
  }

  @handler(IpcLiveModeCommand)
  async onLiveMode(command: IpcLiveModeCommand) {
    const session = live(this.descriptor);

    await session.awake();
  }

  @handler(IpcPaperModeCommand)
  async onPaperMode(command: IpcPaperModeCommand) {
    const session = paper(this.descriptor, {
      balance: {
        'binance:usdt': 100
      }
    });

    await session.awake();
  }

  @handler(IpcBacktestModeCommand)
  async onBacktestMode(command: IpcBacktestModeCommand) {
    const session = backtest(this.descriptor, {
      from: command.from,
      to: command.to,
      balance: {
        'binance:usdt': 100
      }
      //progress: timestamp => notify({ type: 'update', timestamp, command.from, command.to }),
      //completed: () => notify({ type: 'completed' })
    });
  }
}

export async function ipc(
  descriptor: SessionDescriptor,
  ...commands: { type: string }[]
) {
  const handler = new IpcHandler(descriptor);

  process.on('message', async (request: any) => {
    const response = await handler.dispatch(request, {});

    if (response) {
      process.send(response);
    }
  });

  for (const command of commands) {
    await handler.dispatch(command, {});
  }
}

export function backtest(
  descriptor: SessionDescriptor,
  options: BacktesterOptions
): Session {
  const store = new Store();
  const adapter = descriptor.adapter();
  const feed = descriptor.feed();

  const streamer = new BacktesterStreamer(store, feed, options);
  const aggregate = new AdapterAggregate(
    store,
    adapter.map(
      it => new PaperAdapter(new BacktesterAdapter(it, streamer), store, options)
    )
  );

  return new Session(store, aggregate, descriptor);
}

export function paper(descriptor: SessionDescriptor, options: PaperOptions): Session {
  const store = new Store();
  const adapter = descriptor.adapter();
  const aggregate = new AdapterAggregate(
    store,
    adapter.map(it => new PaperAdapter(it, store, options))
  );

  return new Session(store, aggregate, descriptor);
}

export function live(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const adapter = descriptor.adapter();
  const aggregate = new AdapterAggregate(store, adapter);

  return new Session(store, aggregate, descriptor);
}

export function idle(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const adapter = descriptor.adapter();
  const aggregate = new AdapterAggregate(store, adapter);

  process.on('message', (message: any) => console.log(message));

  return new Session(store, aggregate);
}

export async function feed(
  descriptor: SessionDescriptor,
  options: {
    from: number;
    to: number;
    instrument: InstrumentSelector;
    progress: (timestamp: number) => void;
  }
) {
  const aggregate = new AdapterAggregate(new Store(), descriptor.adapter());
  await aggregate.awake(false);

  await aggregate.dispatch(
    options.instrument.base.exchange,
    new AdapterFeedCommand(
      options.instrument,
      options.from,
      options.to,
      descriptor.feed(),
      options.progress
    )
  );

  await aggregate.dispose();
}

export async function exec(descriptor: SessionDescriptor): Promise<void> {
  const argv = minimist(process.argv.slice(2));
  const command = <IpcPaperModeCommand>{ type: 'paper' };

  await ipc(descriptor, command);
}
