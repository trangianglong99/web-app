import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfileFormService } from './profile-form.service';
import { CreateProfileFormDto } from './dto/create-profile-form.dto';
import { UpdateProfileFormDto } from './dto/update-profile-form.dto';

@Controller('profile-form')
export class ProfileFormController {
  constructor(private readonly profileFormService: ProfileFormService) {}

  @Post()
  create(@Body() createProfileFormDto: CreateProfileFormDto) {
    return this.profileFormService.create(createProfileFormDto);
  }

  @Get()
  findAll(@Query('fullName') fullName?: string, @Query('ward') ward?: string) {
    if (fullName) {
      return this.profileFormService.findByFullName(fullName);
    }
    if (ward) {
      return this.profileFormService.findByWard(ward);
    }
    return this.profileFormService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileFormService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileFormDto: UpdateProfileFormDto,
  ) {
    return this.profileFormService.update(id, updateProfileFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileFormService.remove(id);
  }

  @Get(':id/export')
  exportToWord(@Param('id') id: string) {
    return this.profileFormService.exportToWord(id);
  }
}
