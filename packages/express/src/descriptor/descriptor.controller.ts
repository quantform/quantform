import { Get, JsonController, Param } from 'routing-controllers';
import { Service } from 'typedi';
import { DescriptorService } from './descriptor.service';
import {
  DescriptorIndexResponse,
  DescriptorTemplateResponse
} from './descriptor.contract';
import { ResponseSchema } from 'routing-controllers-openapi';

@JsonController('/descriptor')
@Service()
export class DescriptorController {
  constructor(private readonly descriptor: DescriptorService) {}

  @Get()
  @ResponseSchema(DescriptorIndexResponse)
  async index(): Promise<DescriptorIndexResponse> {
    return {
      descriptors: this.descriptor.index().map(it => ({
        name: it
      }))
    };
  }

  @Get('/:name')
  async template(@Param('name') name: string): Promise<DescriptorTemplateResponse> {
    const content = this.descriptor.template(name);

    return {
      content
    };
  }
}
