import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus, AttendanceUnit } from '../../common/enums';

export class CreateAttendanceDto {
  @IsDateString()
  date: string; // ISO date

  @IsString()
  fullName: string;

  @IsEnum(AttendanceUnit)
  unit: AttendanceUnit;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
