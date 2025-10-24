import { Module } from '@nestjs/common';
import { ProfileFormService } from './profile-form.service';
import { ProfileFormController } from './profile-form.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileFormController],
  providers: [ProfileFormService],
  exports: [ProfileFormService],
})
export class ProfileFormModule {}
