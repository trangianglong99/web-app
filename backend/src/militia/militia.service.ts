import { Injectable } from '@nestjs/common';
import { CreateMilitiaDto } from './dto/create-militia.dto';
import { UpdateMilitiaDto } from './dto/update-militia.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MilitiaRole } from '../common/enums';

@Injectable()
export class MilitiaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMilitiaDto: CreateMilitiaDto) {
    return this.prisma.militia.create({ data: { ...createMilitiaDto } });
  }

  findAll(params?: { q?: string; role?: MilitiaRole; active?: boolean }) {
    const { q, role, active } = params || {};
    return this.prisma.militia.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { fullName: { contains: q } },
                  { ward: { contains: q } },
                  { phone: { contains: q } },
                ],
              }
            : {},
          role ? { role } : {},
          active !== undefined ? { active } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.militia.findUnique({ where: { id } });
  }

  update(id: string, updateMilitiaDto: UpdateMilitiaDto) {
    return this.prisma.militia.update({ where: { id }, data: { ...updateMilitiaDto } });
  }

  remove(id: string) {
    return this.prisma.militia.delete({ where: { id } });
  }
}
