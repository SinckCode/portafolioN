import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Enrollment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: [{ lessonSlug: String, completed: Boolean, completedAt: Date, videoPosition: Number }], default: [] })
  progress: { lessonSlug: string; completed: boolean; completedAt?: Date; videoPosition?: number }[];

  @Prop({ default: 0, min: 0, max: 100 })
  overallProgress: number;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  certificateId: string;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
