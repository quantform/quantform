import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class MeasurementQuery {
  @IsString()
  session: string;
  @IsNumber()
  timestamp: number;
  @IsBoolean()
  forward: boolean;
}
