import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;
}
