import { IsOptional, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinksDto {
  @IsOptional() @IsString() github?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() twitter?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() instagram?: string;
}

class HeroConfigDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() ctaText?: string;
  @IsOptional() @IsString() ctaLink?: string;
}

export class UpdateSiteConfigDto {
  @IsOptional() @IsString() siteName?: string;
  @IsOptional() @IsString() siteDescription?: string;
  @IsOptional() @IsString() ownerName?: string;
  @IsOptional() @IsString() ownerEmail?: string;
  @IsOptional() @IsString() ownerAvatar?: string;
  @IsOptional() @IsString() ownerBio?: string;
  @IsOptional() @ValidateNested() @Type(() => SocialLinksDto) socialLinks?: SocialLinksDto;
  @IsOptional() @ValidateNested() @Type(() => HeroConfigDto) hero?: HeroConfigDto;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() faviconUrl?: string;
  @IsOptional() @IsBoolean() maintenanceMode?: boolean;
  @IsOptional() @IsString() analyticsId?: string;
}
