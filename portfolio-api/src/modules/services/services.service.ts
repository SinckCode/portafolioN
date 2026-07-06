import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceDocument> {
    const slug =
      createServiceDto.slug || slugify(createServiceDto.title, { lower: true, strict: true });
    const service = new this.serviceModel({ ...createServiceDto, slug });
    return service.save();
  }

  async findAll(filters?: { status?: string }) {
    // Público por defecto: solo servicios activos. status=all para el admin.
    const query: Record<string, unknown> = {};
    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    } else if (!filters?.status) {
      query.status = 'active';
    }

    const data = await this.serviceModel.find(query).sort({ order: 1, createdAt: 1 }).exec();
    return { data, total: data.length };
  }

  async findBySlug(slug: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findOne({ slug }).exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceDocument> {
    if (updateServiceDto.title && !updateServiceDto.slug) {
      updateServiceDto.slug = slugify(updateServiceDto.title, { lower: true, strict: true });
    }
    const service = await this.serviceModel
      .findByIdAndUpdate(id, { $set: updateServiceDto }, { new: true })
      .exec();
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Service not found');
    }
  }
}
