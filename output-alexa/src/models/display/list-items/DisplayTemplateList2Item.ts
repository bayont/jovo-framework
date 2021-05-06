import { IsNotEmpty, IsOptional, IsString, Type, ValidateNested } from '@jovotech/output';
import { MainTextMaxLength } from '../../../decorators/validation/MainTextMaxLength';
import { Image } from '../../common/Image';
import { TextContent } from '../TextContent';

export class DisplayTemplateList2Item {
  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateNested()
  @Type(() => Image)
  image: Image;

  @MainTextMaxLength(84)
  @ValidateNested()
  @Type(() => TextContent)
  textContent: TextContent;

  @IsOptional()
  @ValidateNested()
  @Type(() => Image)
  backgroundImage?: Image;
}