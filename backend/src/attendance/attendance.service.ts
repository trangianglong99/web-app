import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, AttendanceUnit } from '../common/enums';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAttendanceDto: CreateAttendanceDto) {
    const { date, ...rest } = createAttendanceDto;
    return this.prisma.attendance.create({
      data: { ...rest, date: new Date(date) },
    });
  }

  findAll(params?: { date?: string; q?: string; unit?: AttendanceUnit }) {
    const { date, q, unit } = params || {};
    return this.prisma.attendance.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { fullName: { contains: q } },
                  { note: { contains: q } },
                ],
              }
            : {},
          unit ? { unit } : {},
          date ? { date: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 24*60*60*1000) } } : {},
        ],
      },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.attendance.findUnique({ where: { id } });
  }

  update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const { date, ...rest } = updateAttendanceDto as any;
    return this.prisma.attendance.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  remove(id: string) {
    return this.prisma.attendance.delete({ where: { id } });
  }
}
