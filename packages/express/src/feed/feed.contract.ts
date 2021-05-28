import { IsNumber, IsString } from 'class-validator';

export class FeedImportCommand {
  @IsString()
  instrument: string;
  @IsNumber()
  from: number;
  @IsNumber()
  to: number;
}

export class FeedImportResponse {}
