import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class FeedImportCommand {
  @IsString()
  instrument: string;
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
}

export class FeedImportResponse {
  @IsBoolean()
  queued: boolean;
}
