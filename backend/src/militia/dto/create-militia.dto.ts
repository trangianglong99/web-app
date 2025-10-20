import { IsBoolean, IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { MilitiaRole } from '../../common/enums';

export class CreateMilitiaDto {
  @IsOptional()
  @IsString()
  recordCode?: string;

  @IsString()
  fullName: string;

  @IsString()
  ward: string;

  @IsEnum(MilitiaRole)
  role: MilitiaRole;

  @IsString()
  phone: string; // keeping simple; adjust with @IsPhoneNumber if needed

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
