import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug!: string;

  @Prop({ default: '' })
  icon!: string;

  @Prop({ default: '' })
  tagline!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  deliverables!: string[];

  @Prop({ type: [String], default: [] })
  stack!: string[];

  @Prop({ type: String, default: null })
  startingPrice!: string | null;

  @Prop({ default: 'Cotizar proyecto' })
  ctaLabel!: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: 'active', enum: ['active', 'hidden'] })
  status!: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ status: 1, order: 1 });
