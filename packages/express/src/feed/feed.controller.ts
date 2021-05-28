import { Body, JsonController, Param, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { ResponseSchema } from 'routing-controllers-openapi';
import { FeedImportCommand, FeedImportResponse } from './feed.contract';
import { FeedService } from './feed.service';

@JsonController('/feed')
@Service()
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Post('/:name/import')
  @ResponseSchema(FeedImportCommand)
  async import(
    @Param('name') name: string,
    @Body() command: FeedImportCommand
  ): Promise<FeedImportResponse> {
    await this.feed.import(name, command.from, command.to, command.instrument);

    return {};
  }
}
