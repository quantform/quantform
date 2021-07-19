import { Get, JsonController, Param, QueryParams } from 'routing-controllers';
import { Service } from 'typedi';
import { MeasurementService } from './measurement.service';
import { MeasurementQuery } from './measurement.contract';
import 'reflect-metadata';

@JsonController('/measurement')
@Service()
export class MeasurementController {
  constructor(private readonly measurement: MeasurementService) {}

  @Get('/:name/index')
  index(@Param('name') name: string) {
    return this.measurement.index(name);
  }

  @Get('/:name')
  get(@Param('name') name: string, @QueryParams() query: MeasurementQuery) {
    return this.measurement.query(name, query.session, query.timestamp, query.forward);
  }
}
