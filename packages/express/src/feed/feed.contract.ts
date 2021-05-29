import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class FeedImportCommand {
  @IsString()
  instrument: string;
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
  @IsString()
  context: string;
}

export class FeedImportResponse {
  @IsBoolean()
  queued: boolean;
  @IsString()
  context: string;
}
