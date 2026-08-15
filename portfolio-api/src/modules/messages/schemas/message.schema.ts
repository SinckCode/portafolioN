import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  from: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  to: Types.ObjectId;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  readAt: Date;

  @Prop({ default: false })
  deletedByFrom: boolean;

  @Prop({ default: false })
  deletedByTo: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
MessageSchema.index({ to: 1, read: 1 });
MessageSchema.index({ createdAt: -1 });
