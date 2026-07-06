import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug =
      createCategoryDto.slug || slugify(createCategoryDto.name, { lower: true, strict: true });
    const category = new this.categoryModel({ ...createCategoryDto, slug });
    return category.save();
  }

  async findAll(type?: string): Promise<CategoryDocument[]> {
    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    return this.categoryModel.find(query).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = slugify(updateCategoryDto.name, { lower: true, strict: true });
    }
    const category = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateCategoryDto }, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }
}
