import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsStringRecord,
  IsStringOrStringRecord,
} from '@/common/validators/string-record.validator';

class CredentialsDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  // Mapa de etiqueta -> URL: { frontend, backend, hardware, deploy }.
  // Debe coincidir con `repos: { type: Object }` del schema; declararlo como
  // array de { label, url } fue lo que destruyo los links de los 17 proyectos.
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { frontend: 'https://github.com/usuario/repo' },
  })
  @IsOptional()
  @IsStringRecord()
  repos?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  demos?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  video?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional({ type: CredentialsDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CredentialsDto)
  credentials?: CredentialsDto | null;

  @ApiPropertyOptional({
    oneOf: [
      { type: 'string' },
      { type: 'object', additionalProperties: { type: 'string' } },
    ],
    nullable: true,
  })
  @IsOptional()
  @IsStringOrStringRecord()
  api?: string | Record<string, string> | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}
