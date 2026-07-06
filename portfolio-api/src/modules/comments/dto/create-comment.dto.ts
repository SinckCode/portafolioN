import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentTargetType } from '../schemas/comment.schema';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ enum: CommentTargetType })
  @IsEnum(CommentTargetType)
  targetType!: CommentTargetType;

  @ApiProperty()
  @IsString()
  targetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}
