import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { MilitiaService } from './militia.service';
import { CreateMilitiaDto } from './dto/create-militia.dto';
import { UpdateMilitiaDto } from './dto/update-militia.dto';
import { MilitiaRole } from '../common/enums';

@Controller('militia')
export class MilitiaController {
  constructor(private readonly militiaService: MilitiaService) {}

  @Post()
  create(@Body() createMilitiaDto: CreateMilitiaDto) {
    return this.militiaService.create(createMilitiaDto);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('role') role?: MilitiaRole,
    @Query('active') active?: string,
  ) {
    const activeBool = active === undefined ? undefined : active === 'true';
    return this.militiaService.findAll({ q, role, active: activeBool });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.militiaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMilitiaDto: UpdateMilitiaDto) {
    return this.militiaService.update(id, updateMilitiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.militiaService.remove(id);
  }
}
