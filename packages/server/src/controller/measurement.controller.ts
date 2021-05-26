import { Controller, Get, Param, QueryParam } from 'routing-controllers';
import { SessionDescriptorRegistry } from '../service/session-descriptor-registry';
import { Service } from 'typedi';

@Controller('/measurement')
@Service()
export class MeasurementController {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  @Get('/:session')
  async get(
    @Param('session') session: string,
    @QueryParam('id') id: string,
    @QueryParam('timestamp') timestamp: number,
    @QueryParam('forward') forward: boolean
  ) {
    const descriptor = this.registry.resolve(session);
    const measurement = descriptor.measurement();

    const measure = measurement
      ? await measurement.read(id, timestamp, forward ? 'FORWARD' : 'BACKWARD')
      : [];

    return measure;
  }
}
