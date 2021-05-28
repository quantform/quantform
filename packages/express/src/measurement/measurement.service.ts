import { SessionDescriptorRegistry } from '../session/session-descriptor.registry';
import { Service } from 'typedi';

@Service()
export class MeasurementService {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  async query(name: string, session: string, timestamp: number, forward: boolean) {
    const descriptor = this.registry.resolve(name);
    const measurement = descriptor.measurement();

    const measure = measurement
      ? await measurement.read(session, timestamp, forward ? 'FORWARD' : 'BACKWARD')
      : [];

    return measure.splice(0, 5000);
  }
}