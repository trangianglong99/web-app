import { Injectable } from '@nestjs/common';
import { CreateMilitaryDto } from './dto/create-military.dto';
import { UpdateMilitaryDto } from './dto/update-military.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MilitaryStatus } from '../common/enums';

@Injectable()
export class MilitaryService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMilitaryDto: CreateMilitaryDto) {
    const { dateOfBirth, ...rest } = createMilitaryDto;
    return this.prisma.military.create({
      data: { ...rest, dateOfBirth: new Date(dateOfBirth) },
    });
  }

  findAll(params?: { q?: string; status?: MilitaryStatus; ward?: string }) {
    const { q, status, ward } = params || {};
    return this.prisma.military.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { fullName: { contains: q } },
                  { idNumber: { contains: q } },
                  { unit: { contains: q } },
                ],
              }
            : {},
          status ? { status } : {},
          ward ? { ward } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.military.findUnique({ where: { id } });
  }

  update(id: string, updateMilitaryDto: UpdateMilitaryDto) {
    const { dateOfBirth, ...rest } = updateMilitaryDto as any;
    return this.prisma.military.update({
      where: { id },
      data: {
        ...rest,
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.military.delete({ where: { id } });
  }
}
