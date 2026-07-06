import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  SUBSCRIBER = 'subscriber',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  bio!: string;

  @Prop({ default: '' })
  avatar!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.SUBSCRIBER })
  role!: UserRole;

  @Prop({ type: Object, default: {} })
  socialLinks!: Record<string, string>;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: String, default: null })
  verificationToken!: string | null;

  @Prop({ type: String, default: null })
  resetPasswordToken!: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires!: Date | null;

  @Prop({ type: String, default: null })
  refreshToken!: string | null;

  @Prop({ default: 'local' })
  provider!: string;

  @Prop({ type: String, default: null })
  providerId!: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

UserSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.verificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  },
});
