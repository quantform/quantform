import { IsArray, IsBoolean, IsNumber } from 'class-validator';

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

export class SessionBacktestResponse {
  @IsBoolean()
  queued: boolean;
}

export class SessionPaperCommand {}

export class SessionPaperResponse {
  @IsBoolean()
  queued: boolean;
}
