import {
  AdapterAggregate,
  AdapterImportRequest,
  instrumentOf,
  Store
} from '@quantform/core';
import { Body, Controller, Param, Post } from 'routing-controllers';
import { SessionDescriptorRegistry } from '../service/session-descriptor-registry';
import { Service } from 'typedi';

@Controller('/feed')
@Service()
export class FeedController {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  @Post('/:session/import')
  async import(@Param('session') session: string, @Body() body: any) {
    console.log(body);
    const descriptor = this.registry.resolve(session);
    const instrument = instrumentOf(body.instrument);
    const from = body.from;
    const to = Math.min(body.to, new Date().getTime());

    const aggregate = new AdapterAggregate(new Store(), descriptor.adapter());
    await aggregate.initialize();

    await aggregate.execute(
      instrument.base.exchange,
      new AdapterImportRequest(instrument, from, to, descriptor.feed())
    );
  }
}
