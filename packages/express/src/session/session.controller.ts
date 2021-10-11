import { Get, JsonController } from 'routing-controllers';
import { SessionService } from './session.service';
import { ResponseSchema } from 'routing-controllers-openapi';
import { SessionUniverseResponse } from './session.contract';
import { Service } from 'typedi';
import 'reflect-metadata';

@JsonController('/session')
@Service()
export class SessionController {
  constructor(private readonly session: SessionService) {}

  @Get('/universe')
  @ResponseSchema(SessionUniverseResponse)
  async universe(): Promise<SessionUniverseResponse> {
    return this.session.universe();
  }
}
