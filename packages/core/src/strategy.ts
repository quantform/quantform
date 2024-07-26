import { Observable } from 'rxjs';

import { Dependency } from './module';

export type Descriptor = () => Observable<unknown>;

export let before: (descriptor: Descriptor) => void;
export let behavior: (descriptor: Descriptor) => void;
export let after: (descriptor: Descriptor) => void;

export function strategy(descriptor: () => Dependency[]) {
  const description = {
    before: Array.of<Descriptor>(),
    behavior: Array.of<Descriptor>(),
    after: Array.of<Descriptor>()
  };

  before = descriptor => description.before.push(descriptor);
  behavior = descriptor => description.behavior.push(descriptor);
  after = descriptor => description.after.push(descriptor);

  const dependencies = descriptor();

  return {
    dependencies,
    description
  };
}
