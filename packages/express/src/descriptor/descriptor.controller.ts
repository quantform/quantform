import { Get, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { DescriptorService } from './descriptor.service';
import { DescriptorIndexResponse } from './descriptor.contract';
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
}
