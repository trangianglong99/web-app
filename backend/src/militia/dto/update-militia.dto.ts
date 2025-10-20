import { PartialType } from '@nestjs/swagger';
import { CreateMilitiaDto } from './create-militia.dto';

export class UpdateMilitiaDto extends PartialType(CreateMilitiaDto) {}
