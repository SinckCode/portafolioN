import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GenerationService } from './generation.service';
import { GenerateBlogDto } from './dto/generate-blog.dto';

@ApiTags('Generation')
@ApiBearerAuth()
@Controller('generation')
@UseGuards(RolesGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('blog')
  @Roles('admin')
  generateBlog(
    @Body() dto: GenerateBlogDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.generationService.generateBlogPost(dto, userId);
  }
}
