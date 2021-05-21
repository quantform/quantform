import { ExchangeAdapter } from '../exchange-adapter';
import { ExchangeBacktesterOptions } from '../exchange-backtester';
import { Session } from '.';
import { Ipc } from '../ipc';
import { Measurement } from './session-measurement';

export function session(name: string): ClassDecorator {
  return target => {
    target.prototype.name = name;
  };
}

export abstract class SessionDescriptor {
  abstract adapter(): ExchangeAdapter[];

  measurement(): Measurement {
    return null;
  }

  options(): ExchangeBacktesterOptions {
    return {
      balance: {},
      feed: null,
      from: 0,
      to: 0
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  awake(session: Session): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispose(session: Session): Promise<void> {
    return Promise.resolve();
  }
}

export class SessionDescriptorContainer {
  static container: Record<string, SessionDescriptor> = {};

  static resolve(name?: string): SessionDescriptor {
    return name ? this.container[name] : Object.values(this.container)[0];
  }
}

export function spawn(...descriptors: SessionDescriptor[]) {
  for (const descriptor of descriptors) {
    SessionDescriptorContainer.container[descriptor['name']] = descriptor;
  }

  if (process.env.QF_CLI) {
    new Ipc();
  } else {
    if (descriptors.length > 1) {
      throw new Error('');
    }

    Ipc.mediator.send({
      name: 'run'
    });
  }
}
