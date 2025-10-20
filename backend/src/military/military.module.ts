import { Module } from '@nestjs/common';
import { MilitaryService } from './military.service';
import { MilitaryController } from './military.controller';

@Module({
  controllers: [MilitaryController],
  providers: [MilitaryService],
})
export class MilitaryModule {}
