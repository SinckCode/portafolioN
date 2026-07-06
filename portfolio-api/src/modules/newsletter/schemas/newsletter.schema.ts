import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Newsletter extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  unsubscribeToken: string;

  @Prop({ default: Date.now })
  subscribedAt: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
