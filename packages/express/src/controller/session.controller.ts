import { Controller, Param, Get, Post } from 'routing-controllers';
import { Service } from 'typedi';
import 'reflect-metadata';
import { UniverseService } from '../service/universe.service';
import { BacktestingService } from '../service/backtesting.service';

@Controller()
@Service()
export class SessionController {
  constructor(
    private readonly universeService: UniverseService,
    private readonly backtestingService: BacktestingService
  ) {}

  @Get('/:id/universe')
  universe(@Param('id') id: string) {
    return this.universeService.list(id);
  }

  @Post('/:id/backtest')
  backtest(@Param('id') id: string) {
    return this.backtestingService.start(id);
  }
}
