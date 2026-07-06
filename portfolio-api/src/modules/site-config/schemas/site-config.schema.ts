import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SocialLinks {
  @Prop() github?: string;
  @Prop() linkedin?: string;
  @Prop() twitter?: string;
  @Prop() youtube?: string;
  @Prop() instagram?: string;
}

@Schema()
export class HeroConfig {
  @Prop() title?: string;
  @Prop() subtitle?: string;
  @Prop() ctaText?: string;
  @Prop() ctaLink?: string;
}

@Schema({ timestamps: true })
export class SiteConfig extends Document {
  @Prop({ required: true, unique: true, default: 'main' })
  key: string;

  @Prop() siteName: string;
  @Prop() siteDescription: string;
  @Prop() ownerName: string;
  @Prop() ownerEmail: string;
  @Prop() ownerAvatar: string;
  @Prop() ownerBio: string;
  @Prop({ type: SocialLinks }) socialLinks: SocialLinks;
  @Prop({ type: HeroConfig }) hero: HeroConfig;
  @Prop() logoUrl: string;
  @Prop() faviconUrl: string;
  @Prop({ default: false }) maintenanceMode: boolean;
  @Prop() analyticsId: string;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
