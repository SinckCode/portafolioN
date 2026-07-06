import { IsString, IsOptional } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}
