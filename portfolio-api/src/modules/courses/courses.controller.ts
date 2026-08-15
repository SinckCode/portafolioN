import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.coursesService.findAll(query);
  }

  // Antes de :slug para que la ruta no lo capture
  @Get('mine')
  @Roles('admin', 'editor')
  findMine(@CurrentUser() user: any) {
    return this.coursesService.findMine(String(user._id));
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post()
  @Roles('admin', 'editor')
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(dto, user._id);
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.update(id, dto, String(user._id), user.role);
  }

  @Delete(':id')
  @Roles('admin', 'editor')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.remove(id, String(user._id), user.role);
  }

  @Get(':slug/lessons/:lessonSlug')
  async getLesson(
    @Param('slug') slug: string,
    @Param('lessonSlug') lessonSlug: string,
    @CurrentUser() user: any,
  ) {
    const course = await this.coursesService.findBySlugFull(slug);
    const { lesson, moduleTitle } = this.coursesService.getLesson(course, lessonSlug);

    // Free lessons are accessible without enrollment
    if (!lesson.isFree) {
      const enrolled = await this.enrollmentsService.isEnrolled(
        String(user._id),
        String(course._id),
      );
      if (!enrolled && user.role !== 'admin') {
        throw new ForbiddenException('Debes inscribirte en el curso para acceder a esta leccion');
      }
    }

    return { lesson, moduleTitle, courseTitle: course.title };
  }

  @Post(':id/review')
  addReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { rating: number; comment: string },
  ) {
    return this.coursesService.addReview(id, user._id, body.rating, body.comment);
  }
}
