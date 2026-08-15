import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Course } from './schemas/course.schema';
import { Review } from './schemas/review.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async create(dto: CreateCourseDto, instructorId: string): Promise<Course> {
    const slug = slugify(dto.title, { lower: true, strict: true });
    return this.courseModel.create({ ...dto, slug, instructor: instructorId });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, level, category, search, status } = query;
    const filter: any = {};

    // status=all (admin) devuelve todos; sin status solo publicados
    if (status && status !== 'all') filter.status = status;
    else if (!status) filter.status = 'published';

    if (level) filter.level = level;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .populate('instructor', 'name avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.courseModel.countDocuments(filter),
    ]);

    return { data, meta: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string): Promise<any> {
    const course = await this.courseModel
      .findOne({ slug })
      .populate('instructor', 'name avatar bio')
      .populate('category', 'name slug');
    if (!course) throw new NotFoundException('Curso no encontrado');

    // Strip lesson content (videoUrl, content) from public response
    const obj = course.toObject();
    if (obj.modules) {
      obj.modules = obj.modules.map((mod: any) => ({
        ...mod,
        lessons: (mod.lessons || []).map((lesson: any) => ({
          title: lesson.title,
          slug: lesson.slug,
          type: lesson.type,
          duration: lesson.duration,
          isFree: lesson.isFree,
          order: lesson.order,
        })),
      }));
    }
    return obj;
  }

  async findBySlugFull(slug: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({ slug })
      .populate('instructor', 'name avatar bio')
      .populate('category', 'name slug');
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  getLesson(course: Course, lessonSlug: string) {
    for (const mod of course.modules || []) {
      const lesson = (mod.lessons || []).find((l) => l.slug === lessonSlug);
      if (lesson) return { lesson, moduleTitle: mod.title };
    }
    throw new NotFoundException('Leccion no encontrada');
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    userId?: string,
    userRole?: string,
  ): Promise<Course> {
    // Un maestro (editor) solo puede modificar SUS cursos
    if (userId && userRole !== 'admin') {
      const existing = await this.courseModel.findById(id);
      if (!existing) throw new NotFoundException('Curso no encontrado');
      if (existing.instructor?.toString() !== userId) {
        throw new ForbiddenException('Solo puedes editar tus propios cursos');
      }
    }

    if (dto.title) (dto as any).slug = slugify(dto.title, { lower: true, strict: true });
    const course = await this.courseModel.findByIdAndUpdate(id, dto, { new: true });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  async remove(id: string, userId?: string, userRole?: string): Promise<void> {
    if (userId && userRole !== 'admin') {
      const existing = await this.courseModel.findById(id);
      if (!existing) throw new NotFoundException('Curso no encontrado');
      if (existing.instructor?.toString() !== userId) {
        throw new ForbiddenException('Solo puedes eliminar tus propios cursos');
      }
    }

    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Curso no encontrado');
  }

  // Cursos del maestro autenticado (cualquier status) para su panel
  async findMine(userId: string) {
    // Cast explícito: este schema no castea strings a ObjectId en filtros
    const data = await this.courseModel
      .find({ instructor: new Types.ObjectId(userId) })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    return { data, meta: { total: data.length } };
  }

  async addReview(courseId: string, userId: string, rating: number, comment: string) {
    const review = await this.reviewModel.findOneAndUpdate(
      { course: courseId, user: userId },
      { rating, comment },
      { upsert: true, new: true },
    );

    const stats = await this.reviewModel.aggregate([
      { $match: { course: review.course } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length) {
      await this.courseModel.findByIdAndUpdate(courseId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    return review;
  }

  async incrementEnrollment(courseId: string) {
    await this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
  }
}
