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
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'targetType', required: true })
  @ApiQuery({ name: 'targetId', required: true })
  findByTarget(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findByTarget(targetType, targetId, paginationDto);
  }

  @ApiBearerAuth()
  @Get('my')
  findMy(
    @CurrentUser('_id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findByAuthor(userId, paginationDto);
  }

  @ApiBearerAuth()
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  findPending(@Query() paginationDto: PaginationDto) {
    return this.commentsService.findPending(paginationDto);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.commentsService.create(createCommentDto, userId);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.commentsService.update(id, updateCommentDto, userId, userRole);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.commentsService.remove(id, userId, userRole);
  }

  @ApiBearerAuth()
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  approve(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentsService.approve(id);
  }
}
