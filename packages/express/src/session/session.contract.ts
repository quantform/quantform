import { IsArray, IsNumber } from 'class-validator';

export class SessionUniverseResponse {
  @IsArray()
  instruments: string[];
}

export class SessionBacktestCommand {
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
}

export class SessionBacktestResponse {}
