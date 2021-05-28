import { Param, Get, JsonController, Post, Body } from 'routing-controllers';
import { SessionService } from './session.service';
import { ResponseSchema } from 'routing-controllers-openapi';
import {
  SessionBacktestCommand,
  SessionBacktestResponse,
  SessionUniverseResponse
} from './session.contract';
import { Service } from 'typedi';
import 'reflect-metadata';

@JsonController('/session')
@Service()
export class SessionController {
  constructor(private readonly session: SessionService) {}

  @Get('/:name/universe')
  @ResponseSchema(SessionUniverseResponse)
  universe(@Param('name') name: string): Promise<SessionUniverseResponse> {
    return this.session.universe(name);
  }

  @Post('/:name/backtest')
  @ResponseSchema(SessionBacktestResponse)
  async backtest(
    @Param('name') name: string,
    @Body() command: SessionBacktestCommand
  ): Promise<SessionBacktestResponse> {
    await this.session.backtest(name, command.from, command.to);

    return {};
  }
}
