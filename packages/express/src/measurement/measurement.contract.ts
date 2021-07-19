import { IsBoolean, IsNumber } from 'class-validator';

export class MeasurementQuery {
  @IsNumber()
  session: number;
  @IsNumber()
  timestamp: number;
  @IsBoolean()
  forward: boolean;
}
