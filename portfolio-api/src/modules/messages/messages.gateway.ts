import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Message } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId → Set of socket IDs
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      const userId = String(user._id);
      (client as any).userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  emitNewMessage(toUserId: string, message: any) {
    this.server.to(`user:${toUserId}`).emit('newMessage', message);
  }

  emitMessageSent(fromUserId: string, message: any) {
    this.server.to(`user:${fromUserId}`).emit('messageSent', message);
  }

  // Recipient confirms delivery → mark in DB → notify sender
  @SubscribeMessage('messageDelivered')
  async handleDelivered(client: Socket, data: { messageId: string }) {
    try {
      const msg = await this.messageModel.findById(data.messageId);
      if (!msg || msg.delivered) return;

      msg.delivered = true;
      msg.deliveredAt = new Date();
      await msg.save();

      // Notify the sender that their message was delivered
      const senderId = msg.from.toString();
      this.server.to(`user:${senderId}`).emit('statusUpdate', {
        messageId: String(msg._id),
        delivered: true,
        deliveredAt: msg.deliveredAt,
      });
    } catch { /* best-effort */ }
  }

  // Emit read status updates to the sender
  emitReadUpdate(senderId: string, messageIds: string[]) {
    if (messageIds.length === 0) return;
    this.server.to(`user:${senderId}`).emit('statusUpdate', {
      messageIds,
      read: true,
      readAt: new Date(),
    });
  }

  // Check if a user is online (has active sockets)
  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }
}
