import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ default: '' })
  details!: string;

  @Prop({ type: [String], default: [] })
  technologies!: string[];

  @Prop({ default: 'web' })
  type!: string;

  @Prop()
  date!: Date;

  @Prop({ type: Object, default: {} })
  repos!: Record<string, string>;

  @Prop({ default: '' })
  demo!: string;

  @Prop({ type: [String], default: [] })
  demos!: string[];

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ default: '' })
  video!: string;

  @Prop({ type: [String], default: [] })
  videos!: string[];

  @Prop({ type: Object, default: null })
  credentials!: { email: string; password: string } | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  api!: string | Record<string, string> | null;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  category!: Types.ObjectId | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ featured: 1, order: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ technologies: 1 });
