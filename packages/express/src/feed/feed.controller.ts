import { Body, JsonController, Param, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ResponseSchema } from 'routing-controllers-openapi';
import { FeedImportCommand, FeedImportResponse } from './feed.contract';
import { FeedService } from './feed.service';
import { instrumentOf } from '@quantform/core';
import { JobQueue } from '../job-queue';
import { SessionDescriptorRegistry } from '../session/session-descriptor.registry';

@JsonController('/feed')
@Service()
export class FeedController {
  constructor(
    private readonly feed: FeedService,
    private readonly registry: SessionDescriptorRegistry,
    @Inject('feed') private readonly queue: JobQueue
  ) {}

  @Post('/:name/import')
  @ResponseSchema(FeedImportCommand)
  async import(
    @Param('name') name: string,
    @Body() command: FeedImportCommand
  ): Promise<FeedImportResponse> {
    const descriptor = this.registry.resolve(name);
    const instrument = instrumentOf(command.instrument);

    this.queue.enqueue(() =>
      this.feed.import(descriptor, command.from, command.to, instrument)
    );

    return {
      queued: true
    };
  }
}
