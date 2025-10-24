import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MilitaryStatus } from '../../common/enums';

export class CreateMilitaryDto {
  @IsOptional()
  @IsString()
  recordCode?: string; // Mã hồ sơ

  @IsOptional()
  @IsString()
  fullName?: string; // Họ và tên

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; // Ngày sinh - ISO date

  @IsOptional()
  @IsString()
  occupation?: string; // Nghề nghiệp

  @IsOptional()
  @IsString()
  permanentResidence?: string; // Hộ khẩu thường trú (Khu phố)

  @IsOptional()
  @IsString()
  specificAddress?: string; // Địa chỉ cụ thể

  @IsOptional()
  @IsString()
  ethnicity?: string; // Dân tộc

  @IsOptional()
  @IsString()
  religion?: string; // Tôn giáo

  @IsOptional()
  @IsString()
  education?: string; // Học vấn, Chuyên môn kỹ thuật

  @IsOptional()
  @IsString()
  graduationStatus?: string; // Đã tốt nghiệp hoặc niên khóa đang học

  @IsOptional()
  @IsString()
  partyMember?: string; // Đảng viên, đoàn viên hay không

  @IsOptional()
  @IsString()
  familyInfo?: string; // Thông tin Cha, Mẹ, Vợ/Chồng, nghề nghiệp

  @IsOptional()
  @IsEnum(MilitaryStatus)
  status?: MilitaryStatus;
}
