import { Param, Get, JsonController, Post, Body } from 'routing-controllers';
import { SessionService } from './session.service';
import { ResponseSchema } from 'routing-controllers-openapi';
import {
  SessionBacktestCommand,
  SessionBacktestResponse,
  SessionPaperCommand,
  SessionPaperResponse,
  SessionUniverseResponse
} from './session.contract';
import { Inject, Service } from 'typedi';
import 'reflect-metadata';
import { JobQueue } from '../job-queue';
import { SessionDescriptorRegistry } from './session-descriptor.registry';

@JsonController('/session')
@Service()
export class SessionController {
  constructor(
    private readonly session: SessionService,
    private readonly registry: SessionDescriptorRegistry,
    @Inject('feed') private readonly queue: JobQueue
  ) {}

  @Get('/:name/universe')
  @ResponseSchema(SessionUniverseResponse)
  universe(@Param('name') name: string): Promise<SessionUniverseResponse> {
    const descriptor = this.registry.resolve(name);

    return this.session.universe(descriptor);
  }

  @Post('/:name/backtest')
  @ResponseSchema(SessionBacktestResponse)
  async backtest(
    @Param('name') name: string,
    @Body() command: SessionBacktestCommand
  ): Promise<SessionBacktestResponse> {
    const descriptor = this.registry.resolve(name);

    this.queue.enqueue(() => this.session.backtest(descriptor, command.from, command.to));

    return {
      queued: true
    };
  }

  @Post('/:name/paper')
  @ResponseSchema(SessionPaperResponse)
  async paper(
    @Param('name') name: string,
    @Body() command: SessionPaperCommand
  ): Promise<SessionBacktestResponse> {
    const descriptor = this.registry.resolve(name);

    this.queue.enqueue(() => this.session.paper(descriptor));

    return {
      queued: true
    };
  }
}
