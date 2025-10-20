import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MilitaryStatus } from '../../common/enums';

export class CreateMilitaryDto {
  @IsOptional()
  @IsString()
  recordCode?: string;

  @IsString()
  fullName: string;

  @IsDateString()
  dateOfBirth: string; // ISO date

  @IsString()
  idNumber: string;

  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsEnum(MilitaryStatus)
  status: MilitaryStatus;
}
