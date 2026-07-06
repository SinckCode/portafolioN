import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  private calculateReadingTime(content: string): number {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostDocument> {
    const slug =
      createPostDto.slug || slugify(createPostDto.title, { lower: true, strict: true });
    const readingTime = this.calculateReadingTime(createPostDto.content);
    const publishedAt =
      createPostDto.status === PostStatus.PUBLISHED ? new Date() : null;

    const post = new this.postModel({
      ...createPostDto,
      slug,
      readingTime,
      publishedAt,
      author: authorId,
    });
    return post.save();
  }

  async findAll(filterDto: FilterPostDto) {
    const { page, limit, sort, category, tag, status, search, author } = filterDto;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (status) query.status = status;
    if (author) query.author = author;
    if (search) {
      query.$text = { $search: search };
    }

    const sortObj: Record<string, 1 | -1> = {};
    if (sort) {
      const direction = sort.startsWith('-') ? -1 : 1;
      const field = sort.replace(/^-/, '');
      sortObj[field] = direction;
    } else {
      sortObj['publishedAt'] = -1;
    }

    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string): Promise<PostDocument> {
    const post = await this.postModel
      .findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId?: string,
    userRole?: string,
  ): Promise<PostDocument> {
    // Un editor solo puede modificar SUS posts (mismo patron que comments)
    if (userId && userRole !== 'admin') {
      const existing = await this.postModel.findById(id).exec();
      if (!existing) throw new NotFoundException('Post not found');
      if (existing.author.toString() !== userId) {
        throw new ForbiddenException('Solo puedes editar tus propios posts');
      }
    }

    const updateData: Record<string, unknown> = { ...updatePostDto };

    if (updatePostDto.title && !updatePostDto.slug) {
      updateData.slug = slugify(updatePostDto.title, { lower: true, strict: true });
    }
    if (updatePostDto.content) {
      updateData.readingTime = this.calculateReadingTime(updatePostDto.content);
    }
    if (updatePostDto.status === PostStatus.PUBLISHED) {
      const existing = await this.postModel.findById(id).exec();
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await this.postModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async remove(id: string, userId?: string, userRole?: string): Promise<void> {
    if (userId && userRole !== 'admin') {
      const existing = await this.postModel.findById(id).exec();
      if (!existing) throw new NotFoundException('Post not found');
      if (existing.author.toString() !== userId) {
        throw new ForbiddenException('Solo puedes eliminar tus propios posts');
      }
    }

    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Post not found');
    }
  }

  // Posts del usuario autenticado (cualquier status) para su panel
  async findMine(userId: string) {
    const data = await this.postModel
      .find({ author: userId })
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 })
      .exec();
    return { data, total: data.length };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userObjectId = userId;
    const hasLiked = post.likesBy.some((id) => id.toString() === userObjectId);

    if (hasLiked) {
      await this.postModel
        .findByIdAndUpdate(postId, {
          $pull: { likesBy: userObjectId },
          $inc: { likes: -1 },
        })
        .exec();
      return { liked: false };
    } else {
      await this.postModel
        .findByIdAndUpdate(postId, {
          $addToSet: { likesBy: userObjectId },
          $inc: { likes: 1 },
        })
        .exec();
      return { liked: true };
    }
  }
}
