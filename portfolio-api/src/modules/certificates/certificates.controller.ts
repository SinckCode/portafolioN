import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return id.startsWith('AO-')
      ? this.certificatesService.findByNumber(id)
      : this.certificatesService.findById(id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generate(@Body() body: { userId: string; courseId: string; enrollmentId: string }) {
    return this.certificatesService.generate(body.userId, body.courseId, body.enrollmentId);
  }
}
