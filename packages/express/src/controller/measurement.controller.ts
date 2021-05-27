import { Controller, Get, JsonController, Param, QueryParam } from 'routing-controllers';
import { SessionDescriptorRegistry } from '../service/session-descriptor-registry';
import { Service } from 'typedi';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Measure } from '@quantform/core';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsPositive,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasureResponse {
  @IsNumber()
  timestamp: number;
  @IsString()
  type: string;

  [key: string]: any;
}

@JsonController('/measurement')
@Service()
export class MeasurementController {
  constructor(private readonly registry: SessionDescriptorRegistry) {}

  @Get('/:session')
  @OpenAPI({ summary: 'Return a list of users' })
  //@ResponseSchema(MeasureResponse, { isArray: true })
  async get(
    @Param('session') session: string,
    @QueryParam('id') id: string,
    @QueryParam('timestamp') timestamp: number,
    @QueryParam('forward') forward: boolean
  ) {
    const descriptor = this.registry.resolve(session);
    const measurement = descriptor.measurement();

    const measure = measurement
      ? await measurement.read(id, timestamp, forward ? 'FORWARD' : 'BACKWARD')
      : [];

    return measure.splice(0, 5000);
  }
}
