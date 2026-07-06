import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

export enum CategoryType {
  PROJECT = 'project',
  POST = 'post',
  COURSE = 'course',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: String, enum: CategoryType, required: true })
  type!: CategoryType;

  @Prop({ default: '#00bcd4' })
  color!: string;

  @Prop({ default: '' })
  icon!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ type: 1 });
CategorySchema.index({ slug: 1 });
