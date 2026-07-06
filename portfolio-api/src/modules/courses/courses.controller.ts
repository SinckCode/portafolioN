import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

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

  @Post(':id/review')
  addReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { rating: number; comment: string },
  ) {
    return this.coursesService.addReview(id, user._id, body.rating, body.comment);
  }
}
