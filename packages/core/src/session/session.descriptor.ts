import { Adapter } from '../adapter';
import { Session } from '.';
import { Measurement } from './session-measurement';
import { Feed } from '../feed';

export function session(name: string): ClassDecorator {
  return target => {
    target.prototype.name = name;
  };
}

export abstract class SessionDescriptor {
  abstract adapter(): Adapter[];

  feed(): Feed {
    return null;
  }

  measurement(): Measurement {
    return null;
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
