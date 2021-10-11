import {
  BacktesterAdapter,
  BacktesterOptions,
  BacktesterStreamer
} from './adapter/backtester';
import { AdapterAggregate, AdapterFeedCommand } from './adapter';
import { PaperAdapter, PaperOptions } from './adapter/paper';
import { Session, SessionDescriptor } from './session';
import { Store } from './store';
import minimist = require('minimist');
import { instrumentOf, InstrumentSelector } from './domain';

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

export function real(descriptor: SessionDescriptor): Session {
  const store = new Store();
  const adapter = descriptor.adapter();
  const aggregate = new AdapterAggregate(store, adapter);

  return new Session(store, aggregate, descriptor);
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

export async function cli(descriptor: SessionDescriptor): Promise<void> {
  const argv = minimist(process.argv.slice(2));
  const notify = (message: any) => console.log(message);

  if (argv.feed) {
    const from = Date.parse(argv.f);
    const to = Date.parse(argv.t);
    const instrument = instrumentOf(argv.i);

    await feed(descriptor, {
      from,
      to,
      instrument,
      progress: timestamp => notify({ type: 'update', timestamp })
    });

    notify({ type: 'completed' });
  }

  if (argv.backtest) {
    const from = Date.parse(argv.f);
    const to = Date.parse(argv.t);

    return await backtest(descriptor, {
      from,
      to,
      balance: {
        'binance:usdt': 100
      },
      progress: timestamp => notify({ type: 'update', timestamp, from, to }),
      completed: () => notify({ type: 'completed' })
    }).awake();
  }

  if (argv.real) {
    return await real(descriptor).awake();
  }

  return await paper(descriptor, {
    balance: {
      'binance:usdt': 100
    }
  }).awake();
}
