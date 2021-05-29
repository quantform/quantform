import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class SessionUniverseResponse {
  @IsArray()
  instruments: string[];
}

export class SessionBacktestCommand {
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;

  @IsString()
  context: string;
}

export class SessionBacktestResponse {
  @IsString()
  context: string;

  @IsBoolean()
  queued: boolean;
}

export class SessionPaperCommand {
  @IsString()
  context: string;
}

export class SessionPaperResponse {
  @IsString()
  context: string;
}
