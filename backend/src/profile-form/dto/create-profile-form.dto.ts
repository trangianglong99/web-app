import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProfileFormDto {
  // Thông tin cá nhân
  @IsString()
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  idNumber: string;

  @IsString()
  placeOfBirth: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  // Thông tin gia đình
  @IsString()
  fatherName: string;

  @IsString()
  fatherOccupation: string;

  @IsString()
  @IsOptional()
  fatherAddress?: string;

  @IsString()
  motherName: string;

  @IsString()
  motherOccupation: string;

  @IsString()
  @IsOptional()
  motherAddress?: string;

  // Thông tin nghĩa vụ quân sự
  @IsString()
  @IsOptional()
  militaryCode?: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  enlistmentDate?: string;

  @IsDateString()
  @IsOptional()
  dischargeDate?: string;

  @IsString()
  @IsOptional()
  militaryRank?: string;

  @IsString()
  @IsOptional()
  militaryUnit?: string;

  // Thông tin bổ sung
  @IsString()
  @IsOptional()
  healthStatus?: string;

  @IsString()
  @IsOptional()
  criminalRecord?: string;

  @IsString()
  @IsOptional()
  politicalBackground?: string;

  @IsString()
  @IsOptional()
  foreignTravel?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
