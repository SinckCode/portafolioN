import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<CommentDocument> {
    const comment = new this.commentModel({
      ...createCommentDto,
      author: authorId,
    });
    return (await comment.save()).populate('author', 'name avatar');
  }

  async findByTarget(targetType: string, targetId: string, paginationDto: PaginationDto): Promise<any> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const query = { targetType, targetId, isApproved: true, parentId: null };

    const [data, total] = await Promise.all([
      this.commentModel
        .find(query)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query).exec(),
    ]);

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const replies = await this.commentModel
          .find({ parentId: comment._id, isApproved: true })
          .populate('author', 'name avatar')
          .sort({ createdAt: 1 })
          .exec();
        return { ...comment.toJSON(), replies };
      }),
    );

    return { data: commentsWithReplies, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    userRole: string,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    return comment.save();
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.findByIdAndDelete(id).exec();
    // Also delete replies
    await this.commentModel.deleteMany({ parentId: id }).exec();
  }

  async approve(id: string): Promise<CommentDocument> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async findPending(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const query = { isApproved: false };

    const [data, total] = await Promise.all([
      this.commentModel
        .find(query)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
