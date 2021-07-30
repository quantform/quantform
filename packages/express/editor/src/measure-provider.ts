import {
  EditorMeasure,
  EditorProvider,
  EditorTemplate,
  parseTemplate
} from '@quantform/editor-react-component';
import { Configuration, DescriptorApi, MeasurementApi } from './api';

export class ExpressMeasureProvider extends EditorProvider {
  private readonly measurementApi = new MeasurementApi(
    new Configuration({ basePath: this.address })
  );

  private readonly descriptorApi = new DescriptorApi(
    new Configuration({ basePath: this.address })
  );

  constructor(
    private readonly address: string,
    session: number,
    private readonly descriptor: string
  ) {
    super(session);
  }

  protected async fetchTemplate(): Promise<EditorTemplate> {
    const response = await this.descriptorApi.descriptorControllerTemplate({
      name: this.descriptor
    });

    return parseTemplate(response.content);
  }

  protected async fetchMeasure(
    direction: number,
    timestamp: number
  ): Promise<EditorMeasure[]> {
    const response = await this.measurementApi.measurementControllerGetRaw({
      name: this.descriptor,
      forward: direction > 0,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  protected subscribe(): EventSource {
    return new EventSource(`${this.address}/event?context=${this.session}`);
  }
}
