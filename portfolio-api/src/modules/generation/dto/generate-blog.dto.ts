import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateBlogDto {
  @ApiProperty({ description: 'Tema o keyword principal del post' })
  @IsString()
  topic!: string;

  @ApiPropertyOptional({ enum: ['tutorial', 'guide', 'opinion', 'review'] })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({ default: 'es' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetKeywords?: string[];
}
