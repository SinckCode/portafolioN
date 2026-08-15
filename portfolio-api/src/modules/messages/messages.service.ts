import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async create(dto: CreateMessageDto, fromUserId: string): Promise<Message> {
    return this.messageModel.create({
      from: fromUserId,
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
    });
  }

  async getInbox(userId: string) {
    return this.messageModel
      .find({ to: userId, deletedByTo: false })
      .populate('from', 'name avatar email')
      .sort({ createdAt: -1 });
  }

  async getSent(userId: string) {
    return this.messageModel
      .find({ from: userId, deletedByFrom: false })
      .populate('to', 'name avatar email')
      .sort({ createdAt: -1 });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({ to: userId, read: false, deletedByTo: false });
  }

  async findOne(id: string, userId: string): Promise<Message> {
    const message = await this.messageModel
      .findById(id)
      .populate('from', 'name avatar email')
      .populate('to', 'name avatar email');
    if (!message) throw new NotFoundException('Mensaje no encontrado');

    const isFrom = message.from._id?.toString() === userId || (message.from as any)?.toString() === userId;
    const isTo = message.to._id?.toString() === userId || (message.to as any)?.toString() === userId;
    if (!isFrom && !isTo) {
      throw new ForbiddenException('No tienes acceso a este mensaje');
    }

    // Mark as read if recipient opens it
    if (isTo && !message.read) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }

    return message;
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Mensaje no encontrado');

    const isFrom = message.from.toString() === userId;
    const isTo = message.to.toString() === userId;
    if (!isFrom && !isTo) {
      throw new ForbiddenException('No tienes acceso a este mensaje');
    }

    // Soft delete: mark as deleted for the user
    if (isFrom) message.deletedByFrom = true;
    if (isTo) message.deletedByTo = true;

    // If both deleted, remove from DB
    if (message.deletedByFrom && message.deletedByTo) {
      await this.messageModel.findByIdAndDelete(id);
    } else {
      await message.save();
    }
  }
}
