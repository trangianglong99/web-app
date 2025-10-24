import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileFormDto } from './dto/create-profile-form.dto';
import { UpdateProfileFormDto } from './dto/update-profile-form.dto';

@Injectable()
export class ProfileFormService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileFormDto: CreateProfileFormDto) {
    return this.prisma.profileForm.create({
      data: createProfileFormDto,
    });
  }

  async findAll() {
    return this.prisma.profileForm.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const profileForm = await this.prisma.profileForm.findUnique({
      where: { id },
    });

    if (!profileForm) {
      throw new NotFoundException(`ProfileForm with ID ${id} not found`);
    }

    return profileForm;
  }

  async update(id: string, updateProfileFormDto: UpdateProfileFormDto) {
    const existingProfileForm = await this.findOne(id);

    return this.prisma.profileForm.update({
      where: { id },
      data: updateProfileFormDto,
    });
  }

  async remove(id: string) {
    const existingProfileForm = await this.findOne(id);

    return this.prisma.profileForm.delete({
      where: { id },
    });
  }

  async findByFullName(fullName: string) {
    return this.prisma.profileForm.findMany({
      where: {
        fullName: {
          contains: fullName,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByWard(ward: string) {
    return this.prisma.profileForm.findMany({
      where: {
        ward: {
          contains: ward,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async exportToWord(id: string) {
    const profileForm = await this.findOne(id);
    
    // Trả về dữ liệu để frontend xử lý xuất Word
    return {
      success: true,
      data: profileForm,
      message: 'ProfileForm data ready for export',
    };
  }
}
