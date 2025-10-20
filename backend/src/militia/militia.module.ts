import { Module } from '@nestjs/common';
import { MilitiaService } from './militia.service';
import { MilitiaController } from './militia.controller';

@Module({
  controllers: [MilitiaController],
  providers: [MilitiaService],
})
export class MilitiaModule {}
