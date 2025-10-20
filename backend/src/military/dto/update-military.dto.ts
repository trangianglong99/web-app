import { PartialType } from '@nestjs/swagger';
import { CreateMilitaryDto } from './create-military.dto';

export class UpdateMilitaryDto extends PartialType(CreateMilitaryDto) {}
