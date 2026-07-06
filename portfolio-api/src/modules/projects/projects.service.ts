import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectDocument> {
    const slug =
      createProjectDto.slug || slugify(createProjectDto.title, { lower: true, strict: true });
    const project = new this.projectModel({ ...createProjectDto, slug });
    return project.save();
  }

  async findAll(paginationDto: PaginationDto, filters?: { type?: string; featured?: boolean; category?: string; technology?: string }) {
    const { page, limit, sort } = paginationDto;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters?.type) query.type = filters.type;
    if (filters?.featured !== undefined) query.featured = filters.featured;
    if (filters?.category) query.category = filters.category;
    if (filters?.technology) query.technologies = filters.technology;

    const sortObj: Record<string, 1 | -1> = {};
    if (sort) {
      const direction = sort.startsWith('-') ? -1 : 1;
      const field = sort.replace(/^-/, '');
      sortObj[field] = direction;
    } else {
      sortObj['order'] = 1;
      sortObj['createdAt'] = -1;
    }

    const [data, total] = await Promise.all([
      this.projectModel.find(query).populate('category').sort(sortObj).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ slug }).populate('category').exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).populate('category').exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument> {
    if (updateProjectDto.title && !updateProjectDto.slug) {
      updateProjectDto.slug = slugify(updateProjectDto.title, { lower: true, strict: true });
    }
    const project = await this.projectModel
      .findByIdAndUpdate(id, { $set: updateProjectDto }, { new: true })
      .populate('category')
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Project not found');
    }
  }
}
