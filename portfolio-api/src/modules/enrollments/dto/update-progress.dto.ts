import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  lessonSlug: string;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsNumber()
  videoPosition?: number;
}
