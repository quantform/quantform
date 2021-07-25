import {
  Measure,
  MeasureProvider,
  QuantformTemplate
} from '@quantform/editor-react-component';
import { Configuration, DescriptorApi, MeasurementApi } from './api';
import { parse } from 'yaml';

export class ExpressMeasureProvider implements MeasureProvider {
  private readonly measurementApi = new MeasurementApi(
    new Configuration({ basePath: this.address })
  );

  private readonly descriptorApi = new DescriptorApi(
    new Configuration({ basePath: this.address })
  );

  constructor(
    private readonly address: string,
    private readonly session: number,
    private readonly descriptor: string
  ) {}

  async backward(timestamp: number): Promise<Measure[]> {
    const response = await this.measurementApi.measurementControllerGetRaw({
      name: this.descriptor,
      forward: false,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  async forward(timestamp: number): Promise<Measure[]> {
    const response = await this.measurementApi.measurementControllerGetRaw({
      name: this.descriptor,
      forward: true,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  async template(): Promise<QuantformTemplate> {
    const response = await this.descriptorApi.descriptorControllerTemplate({
      name: this.descriptor
    });

    return parse(response.content);
  }
}
