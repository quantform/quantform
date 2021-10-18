import { Get, JsonController, Param, QueryParams } from 'routing-controllers';
import { Service } from 'typedi';
import { MeasurementService } from './measurement.service';
import { MeasurementQuery } from './measurement.contract';
import 'reflect-metadata';

@JsonController('/measurement')
@Service()
export class MeasurementController {
  constructor(private readonly measurement: MeasurementService) {}

  @Get('/index')
  index() {
    return this.measurement.index('');
  }

  @Get()
  get(@QueryParams() query: MeasurementQuery) {
    return this.measurement.query('', query.session, query.timestamp, query.forward);
  }
}
