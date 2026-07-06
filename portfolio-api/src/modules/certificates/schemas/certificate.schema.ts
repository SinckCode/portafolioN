import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Enrollment' })
  enrollment: Types.ObjectId;

  @Prop({ required: true, unique: true })
  certificateNumber: string;

  @Prop({ default: Date.now })
  issuedAt: Date;

  @Prop()
  verificationUrl: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
