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
    const data: any = {
      ...rest,
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    };
    // assign default status via any-typed object to avoid Prisma generated types mismatch
    data.status = rest.status || 'CHUA_NHAP_NGU'; // Default status for military service
    return this.prisma.military.create({ data });
  }

  findAll(params?: {
    q?: string;
    status?: MilitaryStatus;
    permanentResidence?: string;
    specificAddress?: string;
  }) {
    const { q, status, permanentResidence, specificAddress } = params || {};
    const andConditions: any[] = [];

    if (q) {
      andConditions.push({
        OR: [
          { fullName: { contains: q } },
          { recordCode: { contains: q } },
          { occupation: { contains: q } },
          { specificAddress: { contains: q } },
          { permanentResidence: { contains: q } },
        ],
      });
    }

    if (status) {
      // cast to any because Prisma generated types may differ from our enum here
      andConditions.push({ status: status as any });
    }

    if (permanentResidence) {
      andConditions.push({
        permanentResidence: { contains: permanentResidence },
      });
    }

    if (specificAddress) {
      andConditions.push({ specificAddress: { contains: specificAddress } });
    }

    return this.prisma.military.findMany({
      where: {
        AND: andConditions,
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
