import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment } from './schemas/enrollment.schema';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class EnrollmentsService {
  constructor(@InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>) {}

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const existing = await this.enrollmentModel.findOne({ user: userId, course: courseId });
    if (existing) throw new ConflictException('Ya estas inscrito en este curso');
    return this.enrollmentModel.create({ user: userId, course: courseId });
  }

  async findMyEnrollments(userId: string) {
    return this.enrollmentModel
      .find({ user: userId })
      .populate('course', 'title slug coverImage duration level')
      .sort({ startedAt: -1 });
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel.findById(id).populate('course');
    if (!enrollment) throw new NotFoundException('Inscripcion no encontrada');
    return enrollment;
  }

  async updateProgress(id: string, userId: string, dto: UpdateProgressDto): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel.findOne({ _id: id, user: userId });
    if (!enrollment) throw new NotFoundException('Inscripcion no encontrada');

    const idx = enrollment.progress.findIndex((p) => p.lessonSlug === dto.lessonSlug);
    if (idx >= 0) {
      enrollment.progress[idx].completed = dto.completed;
      if (dto.completed) enrollment.progress[idx].completedAt = new Date();
      if (dto.videoPosition !== undefined) enrollment.progress[idx].videoPosition = dto.videoPosition;
    } else {
      enrollment.progress.push({
        lessonSlug: dto.lessonSlug,
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : undefined,
        videoPosition: dto.videoPosition,
      });
    }

    const completedCount = enrollment.progress.filter((p) => p.completed).length;
    const totalLessons = enrollment.progress.length || 1;
    enrollment.overallProgress = Math.round((completedCount / totalLessons) * 100);

    if (enrollment.overallProgress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    return enrollment.save();
  }
}
