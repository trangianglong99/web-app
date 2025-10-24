import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileFormDto } from './create-profile-form.dto';

export class UpdateProfileFormDto extends PartialType(CreateProfileFormDto) {}
