import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PageView extends Document {
  @Prop({ required: true })
  path: string;

  @Prop()
  referrer: string;

  @Prop()
  userAgent: string;

  @Prop()
  ip: string;

  @Prop()
  country: string;

  @Prop()
  device: string;

  @Prop()
  browser: string;

  @Prop({ type: String, ref: 'User' })
  userId: string;

  @Prop({ default: Date.now })
  viewedAt: Date;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);
PageViewSchema.index({ path: 1, viewedAt: -1 });
PageViewSchema.index({ viewedAt: -1 });
