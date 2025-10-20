import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CodeService {
  constructor(private readonly prisma: PrismaService) {}

  async nextProfileCode(prefix: string = 'HS', pad: number = 6) {
    const seq = await this.prisma.$transaction(async (tx) => {
      const current = await tx.sequence.upsert({
        where: { name: 'profile' },
        create: { name: 'profile', value: 1 },
        update: { value: { increment: 1 } },
      });
      return current.value;
    });

    const number = String(seq).padStart(pad, '0');
    return `${prefix}${number}`;
  }
}


