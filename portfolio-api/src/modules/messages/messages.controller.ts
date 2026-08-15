import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto, @CurrentUser() user: any) {
    return this.messagesService.create(dto, String(user._id));
  }

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(String(user._id));
  }

  @Get('conversation/:userId')
  getConversation(@Param('userId') otherUserId: string, @CurrentUser() user: any) {
    return this.messagesService.getConversation(String(user._id), otherUserId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.messagesService.getUnreadCount(String(user._id));
    return { count };
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllConversations() {
    return this.messagesService.getAllConversations();
  }

  @Get('admin/conversation/:userA/:userB')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getConversationBetween(
    @Param('userA') userA: string,
    @Param('userB') userB: string,
  ) {
    return this.messagesService.getConversationBetween(userA, userB);
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminRemove(@Param('id') id: string) {
    return this.messagesService.adminRemove(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.messagesService.remove(id, String(user._id));
  }
}
