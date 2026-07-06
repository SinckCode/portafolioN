import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

export enum CommentTargetType {
  POST = 'post',
  COURSE = 'course',
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @Prop({ type: String, enum: CommentTargetType, required: true })
  targetType!: CommentTargetType;

  @Prop({ type: Types.ObjectId, required: true })
  targetId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId!: Types.ObjectId | null;

  @Prop({ default: false })
  isApproved!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ targetType: 1, targetId: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentId: 1 });
