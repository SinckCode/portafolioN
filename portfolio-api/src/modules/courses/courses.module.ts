import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    EnrollmentsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
