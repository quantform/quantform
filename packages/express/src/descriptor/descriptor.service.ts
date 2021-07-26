import { SessionDescriptorRegistry } from '../session/session-descriptor.registry';
import { Service } from 'typedi';

@Service()
export class DescriptorService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  index() {
    return Object.keys(this.registry.list());
  }

  template(name: string) {
    const descriptor = this.registry.resolve(name);

    return descriptor.template();
  }
}
