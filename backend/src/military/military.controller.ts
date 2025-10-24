import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { MilitaryService } from './military.service';
import { CreateMilitaryDto } from './dto/create-military.dto';
import { UpdateMilitaryDto } from './dto/update-military.dto';
import { MilitaryStatus } from '../common/enums';

@Controller('military')
export class MilitaryController {
  constructor(private readonly militaryService: MilitaryService) {}

  @Post()
  create(@Body() createMilitaryDto: CreateMilitaryDto) {
    return this.militaryService.create(createMilitaryDto);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: MilitaryStatus,
    @Query('permanentResidence') permanentResidence?: string,
    @Query('specificAddress') specificAddress?: string,
  ) {
    return this.militaryService.findAll({ q, status, permanentResidence, specificAddress });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.militaryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMilitaryDto: UpdateMilitaryDto) {
    return this.militaryService.update(id, updateMilitaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.militaryService.remove(id);
  }
}
