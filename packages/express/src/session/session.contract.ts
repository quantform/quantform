import { IsArray } from 'class-validator';

export class SessionUniverseResponse {
  @IsArray()
  instruments: string[];
}
