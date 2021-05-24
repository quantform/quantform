import { handler, Mediator } from './common';
import {
  Session,
  SessionDescriptorContainer,
  SessionFactory,
  SessionOptimizer,
  SessionOptimizerGenerator
} from './session';
import { Store } from './store';
import { instrumentOf } from './domain';
import { AdapterAggregate, AdapterImportRequest } from './adapter';

export interface IpcResponse {
  correlation: string;
  succeed: boolean;
  content: any;
}

export class Ipc {
  static readonly mediator = new Mediator();

  constructor() {
    process.on('message', async message => {
      const request = Object.assign(message, {
        name: message.command
      });

      const response = await Ipc.mediator.send<any, Promise<IpcResponse>>(request);

      process.send({
        command: 'done',
        correlation: response.correlation,
        success: response.succeed,
        content: response.content
      });
    });
  }

  static notify(message: any) {
    if (process && process.send) {
      process.send(message);
    }
  }
}

export interface IpcBacktestRequest {
  name: string;
  correlation: string;
  descriptor: string;
  parameters: any;
}

@handler<IpcBacktestRequest, Promise<IpcResponse>>(Ipc.mediator, 'backtest')
export class IpcBacktestHandler {
  async handle(request: IpcBacktestRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);
    const statement = {};

    const session = await new Promise<Session>(async resolve => {
      SessionOptimizer.source = request.parameters ?? {};

      const session = SessionFactory.backtest(descriptor, () => resolve(session));

      Ipc.notify({
        correlation: request.correlation,
        command: 'session:backtest:started',
        descriptor: request.descriptor,
        session: session.id
      });

      await descriptor.awake(session);
      await session.initialize();
    });

    await session.statement(statement);
    await descriptor.dispose(session);
    await session.dispose();

    Ipc.notify({
      correlation: request.correlation,
      command: 'session:backtest:done',
      descriptor: request.descriptor,
      session: session.id
    });

    return {
      correlation: request.correlation,
      succeed: true,
      content: statement
    };
  }
}

export function ipcBacktestNotify(from: number, to: number, timestamp: number) {
  Ipc.notify({
    command: 'backtest:progress',
    success: true,
    content: {
      from,
      to,
      timestamp
    }
  });
}

export interface IpcFeedRequest {
  name: string;
  correlation: string;
  descriptor: string;
  instrument: string;
  from?: number;
  to?: number;
}

@handler<IpcFeedRequest, Promise<IpcResponse>>(Ipc.mediator, 'feed')
export class IpcFeedHandler {
  async handle(request: IpcFeedRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);
    const store = new Store();
    const instrument = instrumentOf(request.instrument);
    const options = descriptor.options();
    const from = request.from ?? options.from;
    const to = Math.min(request.to ?? options.to, new Date().getTime());

    const aggregate = new AdapterAggregate(store, descriptor.adapter());
    await aggregate.initialize();

    await aggregate.execute(
      instrument.base.exchange,
      new AdapterImportRequest(instrument, from, to, options.feed)
    );

    return {
      correlation: request.correlation,
      succeed: true,
      content: {}
    };
  }
}

export function ipcFeedNotify(from: number, to: number, timestamp: number) {
  Ipc.notify({
    command: 'feed:progress',
    success: true,
    content: {
      from,
      to,
      timestamp
    }
  });
}

export interface IpcOptimizeRequest {
  name: string;
  correlation: string;
  descriptor: string;
  parameters: any;
}

@handler<IpcOptimizeRequest, Promise<IpcResponse>>(Ipc.mediator, 'optimize')
export class IpcOptimizeHandler {
  async handle(request: IpcOptimizeRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);
    const session = SessionFactory.paper(descriptor);

    await descriptor.awake(session);
    const content = SessionOptimizerGenerator.product();
    await descriptor.dispose(session);

    return {
      correlation: request.correlation,
      succeed: true,
      content
    };
  }
}

export interface IpcRunRequest {
  name: string;
  correlation: string;
  descriptor: string;
  parameters: any;
  paper: boolean;
}

@handler<IpcRunRequest, Promise<IpcResponse>>(Ipc.mediator, 'run')
export class IpcRunHandler {
  async handle(request: IpcRunRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);

    SessionOptimizer.source = request.parameters ?? {};

    const session = !request.paper
      ? SessionFactory.real(descriptor)
      : SessionFactory.paper(descriptor);

    await descriptor.awake(session);
    await session.initialize();

    return {
      correlation: request.correlation,
      succeed: true,
      content: {}
    };
  }
}

export interface IpcUniverseRequest {
  name: string;
  correlation: string;
  descriptor: string;
}

@handler<IpcUniverseRequest, Promise<IpcResponse>>(Ipc.mediator, 'universe')
export class IpcUniverseHandler {
  async handle(request: IpcUniverseRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);
    const store = new Store();

    const aggregate = new AdapterAggregate(store, descriptor.adapter());
    await aggregate.initialize();

    return {
      correlation: request.correlation,
      succeed: true,
      content: Object.keys(store.snapshot.universe.instrument).sort()
    };
  }
}

export interface IpcMeasurementRequest {
  name: string;
  correlation: string;
  descriptor: string;
  session: string;
  timestamp: number;
  forward: boolean;
}

@handler<IpcMeasurementRequest, Promise<IpcResponse>>(Ipc.mediator, 'measurement')
export class IpcMeasurementHandler {
  async handle(request: IpcMeasurementRequest): Promise<IpcResponse> {
    const descriptor = SessionDescriptorContainer.resolve(request.descriptor);
    const measurement = descriptor.measurement();

    const measure = measurement
      ? await measurement.read(
          request.session,
          request.timestamp,
          request.forward ? 'FORWARD' : 'BACKWARD'
        )
      : [];

    return {
      correlation: request.correlation,
      succeed: true,
      content: measure
    };
  }
}
