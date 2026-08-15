import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async create(dto: CreateMessageDto, fromUserId: string): Promise<Message> {
    return this.messageModel.create({
      from: fromUserId,
      to: dto.to,
      body: dto.body,
    });
  }

  // Lista de conversaciones: último mensaje con cada usuario
  async getConversations(userId: string) {
    const uid = new Types.ObjectId(userId);

    const conversations = await this.messageModel.aggregate([
      // Mensajes donde participo y no he borrado
      {
        $match: {
          $or: [
            { from: uid, deletedByFrom: { $ne: true } },
            { to: uid, deletedByTo: { $ne: true } },
          ],
        },
      },
      // Ordenar por fecha desc
      { $sort: { createdAt: -1 } },
      // Agrupar por el "otro" usuario
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$from', uid] }, '$to', '$from'],
          },
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$to', uid] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      // Traer info del otro usuario
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser',
        },
      },
      { $unwind: '$otherUser' },
      {
        $project: {
          _id: 0,
          recipientId: '$otherUser._id',
          recipientName: '$otherUser.name',
          recipientAvatar: '$otherUser.avatar',
          lastMessageBody: '$lastMessage.body',
          lastMessageAt: '$lastMessage.createdAt',
          lastMessageFromMe: { $eq: ['$lastMessage.from', uid] },
          unread: 1,
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    return conversations;
  }

  // Mensajes de una conversación con un usuario específico
  async getConversation(userId: string, otherUserId: string) {
    const uid = new Types.ObjectId(userId);
    const otherId = new Types.ObjectId(otherUserId);

    // Marcar como leídos los mensajes que me enviaron
    await this.messageModel.updateMany(
      { from: otherId, to: uid, read: false },
      { $set: { read: true, readAt: new Date() } },
    );

    return this.messageModel
      .find({
        $or: [
          { from: uid, to: otherId, deletedByFrom: { $ne: true } },
          { from: otherId, to: uid, deletedByTo: { $ne: true } },
        ],
      })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort({ createdAt: 1 }); // cronológico ascendente
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      to: new Types.ObjectId(userId),
      read: false,
      deletedByTo: { $ne: true },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Mensaje no encontrado');

    const isFrom = message.from.toString() === userId;
    const isTo = message.to.toString() === userId;
    if (!isFrom && !isTo) {
      throw new ForbiddenException('No tienes acceso a este mensaje');
    }

    if (isFrom) message.deletedByFrom = true;
    if (isTo) message.deletedByTo = true;

    if (message.deletedByFrom && message.deletedByTo) {
      await this.messageModel.findByIdAndDelete(id);
    } else {
      await message.save();
    }
  }
}
