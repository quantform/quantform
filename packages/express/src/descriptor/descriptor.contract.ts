import { Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class DescriptorModel {
  @IsString()
  name: string;
}

export class DescriptorIndexResponse {
  @IsArray()
  @Type(() => DescriptorModel)
  descriptors: DescriptorModel[];
}

export class DescriptorTemplateResponse {
  @IsString()
  content: string;
}
