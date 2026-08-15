import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto, @CurrentUser() user: any) {
    return this.messagesService.create(dto, String(user._id));
  }

  @Get('inbox')
  getInbox(@CurrentUser() user: any) {
    return this.messagesService.getInbox(String(user._id));
  }

  @Get('sent')
  getSent(@CurrentUser() user: any) {
    return this.messagesService.getSent(String(user._id));
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.messagesService.getUnreadCount(String(user._id));
    return { count };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.findOne(id, String(user._id));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.remove(id, String(user._id));
  }
}
