import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  findAll(@Query() filterDto: FilterPostDto) {
    return this.postsService.findAll(filterDto);
  }

  // Antes de :slug para que la ruta no lo capture
  @ApiBearerAuth()
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  findMine(@CurrentUser('_id') userId: string) {
    return this.postsService.findMine(userId);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser('_id') userId: string) {
    return this.postsService.create(createPostDto, userId);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: { _id: string; role: string },
  ) {
    return this.postsService.update(id, updatePostDto, String(user._id), user.role);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: { _id: string; role: string },
  ) {
    return this.postsService.remove(id, String(user._id), user.role);
  }

  @ApiBearerAuth()
  @Post(':id/like')
  toggleLike(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.postsService.toggleLike(id, userId);
  }
}
