import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@CurrentUser() user: any, @Body() body: { courseId: string }) {
    return this.enrollmentsService.enroll(user._id, body.courseId);
  }

  @Get('my')
  findMy(@CurrentUser() user: any) {
    return this.enrollmentsService.findMyEnrollments(user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findById(id);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(id, user._id, dto);
  }
}
