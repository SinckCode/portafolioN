import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ enum: ['video', 'text', 'quiz'], default: 'video' })
  type: string;

  @Prop()
  content: string;

  @Prop()
  videoUrl: string;

  @Prop()
  duration: number;

  @Prop({ default: false })
  isFree: boolean;

  @Prop({ default: 0 })
  order: number;
}

@Schema({ _id: false })
export class CourseModule {
  @Prop({ required: true })
  title: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [Lesson], default: [] })
  lessons: Lesson[];
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  coverImage: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  instructor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  level: string;

  @Prop()
  duration: string;

  @Prop({ type: [CourseModule], default: [] })
  modules: CourseModule[];

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  enrollmentCount: number;

  @Prop({ enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  whatYouLearn: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ slug: 1 });
CourseSchema.index({ status: 1 });
