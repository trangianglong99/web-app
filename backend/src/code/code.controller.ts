import { Controller, Get, Query } from '@nestjs/common';
import { CodeService } from './code.service';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get('profile')
  async generate(@Query('prefix') prefix?: string, @Query('pad') pad?: string) {
    const code = await this.codeService.nextProfileCode(prefix, pad ? parseInt(pad, 10) : undefined);
    return { code };
  }
}


