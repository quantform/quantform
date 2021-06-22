import { Adapter } from '../adapter';
import { Session } from '.';
import { Measurement } from '../storage/measurement';
import { Feed } from '../storage';

export function session(name: string): ClassDecorator {
  return target => {
    target.prototype.name = name;

    const wrap = function(fn: string) {
      const source = target.prototype[fn];
      let value;

      target.prototype[fn] = function() {
        return value ?? (value = source.call(this));
      };
    };

    wrap('adapter');
    wrap('feed');
    wrap('measurement');
    wrap('template');
  };
}

export function editor(name: string) {
  return function(target: new () => SessionDescriptor) {};
}

export interface SessionDescriptor {
  /**
   * defines supported adapters by this strategy.
   */
  adapter(): Adapter[];

  /**
   * defines input and output feed for backtesting purposes.
   */

  feed?(): Feed;
  /**
   * defines measurement storage.
   */
  measurement?(): Measurement;

  template?(): string;

  awake?(session: Session);
  dispose?(session: Session);
}
