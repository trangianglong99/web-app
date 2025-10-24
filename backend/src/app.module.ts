import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MilitaryModule } from './military/military.module';
import { MilitiaModule } from './militia/militia.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CodeModule } from './code/code.module';
import { ProfileFormModule } from './profile-form/profile-form.module';

@Module({
  imports: [PrismaModule, AuthModule, CodeModule, MilitaryModule, MilitiaModule, AttendanceModule, ProfileFormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
