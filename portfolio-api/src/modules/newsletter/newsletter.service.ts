import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Newsletter } from './schemas/newsletter.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(@InjectModel(Newsletter.name) private newsletterModel: Model<Newsletter>) {}

  async subscribe(dto: SubscribeDto) {
    const existing = await this.newsletterModel.findOne({ email: dto.email });
    if (existing) {
      if (existing.isActive) throw new ConflictException('Ya estas suscrito');
      existing.isActive = true;
      return existing.save();
    }
    return this.newsletterModel.create({ ...dto, unsubscribeToken: uuid() });
  }

  async unsubscribe(token: string) {
    const sub = await this.newsletterModel.findOne({ unsubscribeToken: token });
    if (!sub) throw new NotFoundException('Token invalido');
    sub.isActive = false;
    return sub.save();
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.newsletterModel.find({ isActive: true }).sort({ subscribedAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.newsletterModel.countDocuments({ isActive: true }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
