import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private messagesGateway: MessagesGateway,
  ) {}

  async create(dto: CreateMessageDto, fromUserId: string) {
    const fromOid = new Types.ObjectId(fromUserId);
    const toOid = new Types.ObjectId(dto.to);

    const message = await this.messageModel.create({
      from: fromOid,
      to: toOid,
      body: dto.body,
    });

    // Populate from/to for the response and real-time event
    const populated = await this.messageModel
      .findById(message._id)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .lean();

    if (populated) {
      // Emit via WebSocket (best-effort, don't block)
      try {
        this.messagesGateway.emitNewMessage(dto.to, populated);
        this.messagesGateway.emitMessageSent(fromUserId, populated);
      } catch { /* WebSocket may not be connected */ }
    }

    return populated || message;
  }

  // Lista de conversaciones: último mensaje con cada usuario
  async getConversations(userId: string) {
    const uid = new Types.ObjectId(userId);

    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { from: uid, deletedByFrom: { $ne: true } },
            { to: uid, deletedByTo: { $ne: true } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
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

    // Find unread messages from the other user to mark as read
    const unreadMsgs = await this.messageModel.find(
      { from: otherId, to: uid, read: false },
      { _id: 1 },
    ).lean();

    if (unreadMsgs.length > 0) {
      await this.messageModel.updateMany(
        { _id: { $in: unreadMsgs.map((m) => m._id) } },
        { $set: { read: true, readAt: new Date() } },
      );

      // Notify the sender that their messages were read
      try {
        this.messagesGateway.emitReadUpdate(
          otherUserId,
          unreadMsgs.map((m) => String(m._id)),
        );
      } catch { /* best-effort */ }
    }

    return this.messageModel
      .find({
        $or: [
          { from: uid, to: otherId, deletedByFrom: { $ne: true } },
          { from: otherId, to: uid, deletedByTo: { $ne: true } },
        ],
      })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();
  }

  // Admin: todas las conversaciones del sistema
  async getAllConversations() {
    return this.messageModel.aggregate([
      {
        $match: {
          deletedByFrom: { $ne: true },
          deletedByTo: { $ne: true },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$from', '$to'] },
              { a: '$from', b: '$to' },
              { a: '$to', b: '$from' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          totalMessages: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.a',
          foreignField: '_id',
          as: 'userA',
        },
      },
      { $unwind: '$userA' },
      {
        $lookup: {
          from: 'users',
          localField: '_id.b',
          foreignField: '_id',
          as: 'userB',
        },
      },
      { $unwind: '$userB' },
      {
        $project: {
          _id: 0,
          userA: { _id: '$userA._id', name: '$userA.name' },
          userB: { _id: '$userB._id', name: '$userB.name' },
          lastMessageBody: '$lastMessage.body',
          lastMessageAt: '$lastMessage.createdAt',
          totalMessages: 1,
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);
  }

  // Admin: ver conversación entre dos usuarios
  async getConversationBetween(userAId: string, userBId: string) {
    const a = new Types.ObjectId(userAId);
    const b = new Types.ObjectId(userBId);

    return this.messageModel
      .find({
        $or: [
          { from: a, to: b },
          { from: b, to: a },
        ],
      })
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();
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

  // Admin: eliminar mensaje definitivamente
  async adminRemove(id: string): Promise<void> {
    const message = await this.messageModel.findById(id);
    if (!message) throw new NotFoundException('Mensaje no encontrado');
    await this.messageModel.findByIdAndDelete(id);
  }
}
