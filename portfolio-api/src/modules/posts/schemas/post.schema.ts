import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ _id: false })
class SeoMeta {
  @Prop({ default: '' })
  metaTitle!: string;

  @Prop({ default: '' })
  metaDescription!: string;

  @Prop({ type: [String], default: [] })
  metaKeywords!: string[];

  @Prop({ default: '' })
  ogImage!: string;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ default: '' })
  excerpt!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: '' })
  coverImage!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  category!: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status!: PostStatus;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  @Prop({ default: 0 })
  readingTime!: number;

  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likesBy!: Types.ObjectId[];

  @Prop({ type: SeoMeta, default: () => ({}) })
  seo!: SeoMeta;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ title: 'text', content: 'text' });
